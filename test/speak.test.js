const assert = require("node:assert/strict");
const { once } = require("node:events");
const { readFileSync } = require("node:fs");
const { PassThrough, Readable } = require("node:stream");
const { setImmediate: nextTurn } = require("node:timers/promises");
const test = require("node:test");
const { runInNewContext } = require("node:vm");
const voice = require("@discordjs/voice");

const source = readFileSync(require.resolve("../dist/speak"), "utf8");

function createPlayback(t, { stream = Readable.from([Buffer.from([0xf8, 0xff, 0xfe])]), resourceError } = {}) {
    const players = [];
    let watchdog;
    let watchdogCleared = false;
    let resource;
    // Keep the real player/resource scheduler; replace only external I/O and the watchdog clock.
    const connection = {
        state: { status: voice.VoiceConnectionStatus.Ready },
        prepareAudioPacket() {},
        dispatchAudio() {},
        setSpeaking() {},
        onSubscriptionRemoved() {},
        subscribe(player) {
            return player.subscribe(this);
        },
    };
    const module = { exports: {} };
    const dependencies = {
        "@discordjs/voice": {
            ...voice,
            createAudioPlayer() {
                const player = voice.createAudioPlayer();
                players.push(player);
                return player;
            },
            createAudioResource() {
                if (resourceError) throw resourceError;
                resource = voice.createAudioResource(stream, { inputType: voice.StreamType.Opus });
                return resource;
            },
        },
        "google-tts-api": { getAudioUrl: () => "offline-audio" },
        "./environment": { environment: { logging: { speak: false } } },
        "./languages": { LANGUAGES: [] },
        "./services/logger": {},
        "./util/download": { download: async () => "offline-audio" },
    };
    runInNewContext(source, {
        module,
        exports: module.exports,
        require(id) {
            assert.ok(Object.hasOwn(dependencies, id), `Unexpected dependency: ${id}`);
            return dependencies[id];
        },
        setTimeout(callback, delay) {
            assert.equal(delay, 5_000);
            watchdog = callback;
            return 1;
        },
        clearTimeout() {
            watchdogCleared = true;
        },
    });
    t.after(() => {
        for (const player of players) player.stop(true);
        stream.destroy();
    });
    return {
        stream,
        start: () => module.exports.speak("Five", "en-US", connection),
        expire: () => watchdog(),
        get player() {
            return players[0];
        },
        assertFinished() {
            assert.equal(players[0].state.status, voice.AudioPlayerStatus.Idle);
            assert.equal(players[0].subscribers.length, 0);
            assert.equal(players[0].checkPlayable(), false);
            assert.equal(watchdogCleared, true);
        },
        get resource() {
            return resource;
        },
    };
}

test("keeps the subscriber until trailing silence finishes and the player becomes idle", { timeout: 2_000 }, async (t) => {
    const playback = createPlayback(t);
    const finished = playback.start();
    await once(playback.stream, "end");

    assert.notEqual(playback.player.state.status, voice.AudioPlayerStatus.Idle);
    assert.equal(playback.player.subscribers.length, 1);

    await finished;
    assert.equal(playback.resource.silenceRemaining, 0);
    playback.assertFinished();
});

test("forces a stalled player to idle when the playback timeout expires", { timeout: 2_000 }, async (t) => {
    const playback = createPlayback(t, { stream: new PassThrough({ objectMode: true }) });
    const finished = playback.start();
    await nextTurn();
    assert.equal(playback.player.state.status, voice.AudioPlayerStatus.Buffering);

    playback.expire();
    await finished;
    playback.assertFinished();
    assert.equal(playback.stream.destroyed, true);
});

test("rejects playback errors and releases the subscription and watchdog", { timeout: 2_000 }, async (t) => {
    const playback = createPlayback(t, { stream: new PassThrough({ objectMode: true }) });
    const rejected = assert.rejects(playback.start(), /audio failed/);
    await nextTurn();

    playback.stream.destroy(new Error("audio failed"));
    await rejected;
    playback.assertFinished();
});

test("cleans up if audio resource creation throws", async (t) => {
    const playback = createPlayback(t, { resourceError: new Error("resource failed") });
    await assert.rejects(playback.start(), /resource failed/);
    playback.assertFinished();
});
