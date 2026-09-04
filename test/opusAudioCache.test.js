const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const { createReadStream } = require("node:fs");
const { mkdtemp, readdir, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { before, test } = require("node:test");
const ffmpegPath = require("ffmpeg-static");
const { createAudioResource, StreamType } = require("@discordjs/voice");
const { OpusAudioCache } = require("../dist/util/opusAudioCache");

let mp3;
before(() => {
    mp3 = childProcess.execFileSync(ffmpegPath, [
        "-loglevel",
        "error",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:duration=0.1",
        "-f",
        "mp3",
        "pipe:1",
    ]);
});

async function setup(t) {
    const directory = await mkdtemp(path.join(tmpdir(), "tttt-opus-test-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const execFile = childProcess.execFile;
    const conversions = t.mock.method(childProcess, "execFile", (...args) => execFile(...args));
    return { directory, cache: new OpusAudioCache(directory), conversions };
}

test("shares concurrent conversions, publishes complete files, and reuses playable Opus across cache instances", async (t) => {
    const { directory, cache, conversions } = await setup(t);
    const started = Promise.withResolvers();
    const release = Promise.withResolvers();
    t.after(() => release.resolve());
    const downloads = t.mock.method(globalThis, "fetch", async () => {
        started.resolve();
        await release.promise;
        return new Response(mp3);
    });
    const url = "https://example.test/tts?text=Five&lang=en";
    const first = cache.get(url);
    const second = cache.get(url);
    const third = cache.get(url);
    await started.promise;

    assert.equal(downloads.mock.callCount(), 1);
    assert.equal((await readdir(directory)).filter((file) => file.endsWith(".ogg")).length, 0);
    release.resolve();

    const filenames = await Promise.all([first, second, third]);
    assert.equal(new Set(filenames).size, 1);
    assert.equal(conversions.mock.callCount(), 1);
    assert.deepEqual(await readdir(directory), [path.basename(filenames[0])]);

    const persisted = await new OpusAudioCache(directory).get(url);
    assert.equal(persisted, filenames[0]);
    assert.equal(downloads.mock.callCount(), 1);
    assert.equal(conversions.mock.callCount(), 1);

    // Cached playback must only demux Opus packets, without spawning FFmpeg.
    t.mock.method(childProcess, "spawn", () => assert.fail("Cached playback must not spawn a process"));
    const resources = [0, 1].map(() => createAudioResource(createReadStream(persisted), { inputType: StreamType.OggOpus }));
    t.after(() => resources.forEach((resource) => resource.playStream.destroy()));
    assert.notEqual(resources[0].playStream, resources[1].playStream);
    for (const resource of resources) {
        assert.deepEqual(
            resource.edges.map((edge) => edge.type),
            ["ogg/opus demuxer"]
        );
        const packets = [];
        for await (const packet of resource.playStream) {
            packets.push(packet);
        }
        assert.ok(packets.length > 0, "The cached file must contain readable Opus packets");
    }
});

test("uses separate entries for different text and languages", async (t) => {
    const { directory, cache, conversions } = await setup(t);
    t.mock.method(globalThis, "fetch", async () => new Response(mp3));
    const filenames = await Promise.all([
        cache.get("https://example.test/tts?text=Five&lang=en"),
        cache.get("https://example.test/tts?text=Two&lang=en"),
        cache.get("https://example.test/tts?text=Five&lang=de"),
    ]);
    assert.equal(new Set(filenames).size, 3);
    assert.equal(conversions.mock.callCount(), 3);
    assert.equal((await readdir(directory)).length, 3);
});

test("does not cache failed downloads and permits retry", async (t) => {
    const { directory, cache, conversions } = await setup(t);
    let fail = true;
    t.mock.method(globalThis, "fetch", async () => (fail ? new Response(null, { status: 503 }) : new Response(mp3)));
    const url = "https://example.test/tts?text=Five&lang=en";
    await assert.rejects(Promise.all([cache.get(url), cache.get(url)]), /HTTP 503/);
    assert.deepEqual(await readdir(directory), []);
    assert.equal(conversions.mock.callCount(), 0);

    fail = false;
    await cache.get(url);
    assert.equal(conversions.mock.callCount(), 1);
    assert.equal((await readdir(directory)).length, 1);
});

test("removes temporary files after failed transcoding and permits retry", async (t) => {
    const { directory, cache, conversions } = await setup(t);
    let fail = true;
    t.mock.method(globalThis, "fetch", async () => new Response(fail ? "invalid audio" : mp3));
    const url = "https://example.test/tts?text=Five&lang=en";
    await assert.rejects(cache.get(url));
    assert.deepEqual(await readdir(directory), []);
    assert.equal(conversions.mock.callCount(), 1);

    fail = false;
    await cache.get(url);
    assert.equal(conversions.mock.callCount(), 2);
    assert.equal((await readdir(directory)).length, 1);
});
