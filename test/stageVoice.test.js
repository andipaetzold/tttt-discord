const assert = require("node:assert/strict");
const test = require("node:test");
const { ChannelType, PermissionFlagsBits, Collection } = require("discord.js");
const loadModule = require("./helpers/loadModule");

function fixture(type = ChannelType.GuildStageVoice) {
    const warnings = [];
    let requests = 0;
    const voice = {
        channelId: "stage",
        suppress: true,
        serverMute: false,
        requestToSpeakTimestamp: null,
        fetch: async () => voice,
        setRequestToSpeak: async () => { requests += 1; },
    };
    const member = { voice };
    const guild = { id: "guild", members: { me: member }, voiceAdapterCreator: {} };
    const channel = {
        id: "stage", guildId: guild.id, guild, type, joinable: true,
        isVoiceBased: () => true,
        permissionsFor: () => ({ has: () => true }),
    };
    const logger = { info() {}, warn: (...args) => warnings.push(args) };
    const stage = loadModule("util/stageVoice.js", { "../services/logger": { __esModule: true, default: logger } });
    return { channel, voice, guild, member, stage, logger, warnings, requests: () => requests };
}

test("requests to speak only for a suppressed Stage bot without a pending request", async () => {
    for (const [type, suppressed, pending, expected] of [
        [ChannelType.GuildStageVoice, true, null, 1],
        [ChannelType.GuildStageVoice, false, null, 0],
        [ChannelType.GuildStageVoice, true, 123, 0],
        [ChannelType.GuildVoice, true, null, 0],
    ]) {
        const f = fixture(type);
        f.voice.suppress = suppressed;
        f.voice.requestToSpeakTimestamp = pending;
        await f.stage.requestStageSpeaker(f.channel);
        assert.equal(f.requests(), expected);
    }
});

test("missing permissions, unavailable state, and API failures are nonfatal", async () => {
    const scenarios = [
        (f) => { f.channel.permissionsFor = () => ({ has: () => false }); },
        (f) => { f.channel.permissionsFor = () => null; },
        (f) => { f.guild.members.me = undefined; },
        (f) => { f.voice.suppress = null; },
        (f) => { f.voice.channelId = "other"; },
        (f) => { f.voice.fetch = async () => { throw new Error("Missing Access"); }; },
        (f) => { f.voice.setRequestToSpeak = async () => { throw new Error("Missing Permissions"); }; },
    ];
    for (const setup of scenarios) {
        const f = fixture();
        setup(f);
        await assert.doesNotReject(f.stage.requestStageSpeaker(f.channel));
        assert.equal(f.warnings.length, 1);
        assert.equal(f.requests(), 0);
    }
});

test("Stage audio follows current approval and mute state; regular voice is unchanged", () => {
    const f = fixture();
    assert.equal(f.stage.canSpeakInStage(f.channel), false);
    f.voice.suppress = false;
    assert.equal(f.stage.canSpeakInStage(f.channel), true);
    f.voice.serverMute = true;
    assert.equal(f.stage.canSpeakInStage(f.channel), false);
    f.voice.serverMute = false;
    f.voice.suppress = true;
    assert.equal(f.stage.canSpeakInStage(f.channel), false);
    f.voice.suppress = null;
    assert.equal(f.stage.canSpeakInStage(f.channel), false);
    f.channel.type = ChannelType.GuildVoice;
    assert.equal(f.stage.canSpeakInStage(f.channel), true);
});

function connections(f, ready = true) {
    let joins = 0;
    let destroyed = 0;
    let active;
    const connection = Object.assign(new (require("node:events").EventEmitter)(), {
        joinConfig: { channelId: f.channel.id, guildId: f.guild.id },
        state: { status: "ready" }, destroy: () => { destroyed += 1; },
    });
    const voice = {
        VoiceConnectionStatus: { Ready: "ready" },
        joinVoiceChannel: () => { joins += 1; return connection; },
        entersState: async () => { if (!ready) { throw new Error("timeout"); } },
        getVoiceConnection: () => active,
    };
    const connect = loadModule("util/connectToChannel.js", {
        "@discordjs/voice": voice, "../environment": { environment: { botId: "1" } },
        "../services/logger": { __esModule: true, default: f.logger }, "./stageVoice": f.stage,
    });
    return { connection, voice, connect, joins: () => joins, destroyed: () => destroyed, setActive: (value) => { active = value; } };
}

test("a failed Stage request retains the ready connection; failed joins still clean up", async () => {
    const f = fixture();
    f.voice.setRequestToSpeak = async () => { throw new Error("Forbidden"); };
    const c = connections(f);
    assert.equal(await c.connect.connectToChannel(f.channel), c.connection);
    assert.equal(c.destroyed(), 0);
    assert.equal(f.warnings.length, 1);
    const failed = connections(f, false);
    assert.equal(await failed.connect.connectToChannel(f.channel), undefined);
    assert.equal(failed.destroyed(), 1);
    f.channel.joinable = false;
    assert.equal(await c.connect.connectToChannel(f.channel), undefined);
    assert.equal(c.joins(), 1);
});

test("automatic reconnections request once on becoming ready and leave pending requests alone", async () => {
    const f = fixture();
    const c = connections(f);
    await c.connect.connectToChannel(f.channel);
    assert.equal(f.requests(), 1);
    c.connection.emit("stateChange", { status: "ready" }, { status: "ready" });
    await new Promise(setImmediate);
    assert.equal(f.requests(), 1);
    c.connection.emit("stateChange", { status: "connecting" }, { status: "ready" });
    await new Promise(setImmediate);
    assert.equal(f.requests(), 2);
    f.voice.requestToSpeakTimestamp = 123;
    c.connection.emit("stateChange", { status: "connecting" }, { status: "ready" });
    await new Promise(setImmediate);
    assert.equal(f.requests(), 2);
    f.voice.requestToSpeakTimestamp = null;
    f.voice.setRequestToSpeak = async () => { throw new Error("Forbidden after reconnect"); };
    c.connection.emit("stateChange", { status: "connecting" }, { status: "ready" });
    await new Promise(setImmediate);
    assert.equal(c.destroyed(), 0);
    assert.equal(f.warnings.length, 1);
});

test("selection supports voice and Stage, retains precedence, and requests again only on a new join", async () => {
    for (const type of [ChannelType.GuildVoice, ChannelType.GuildStageVoice]) {
        for (const selection of ["member", "persisted", "only"]) {
            const f = fixture(type);
            const c = connections(f);
            const other = { ...f.channel, id: "other" };
            f.guild.channels = new Collection([[f.channel.id, f.channel]]);
            if (selection !== "only") {
                f.guild.channels.set(other.id, other);
            }
            const writes = [];
            const { getVoiceConnection } = loadModule("util/getVoiceConnection.js", {
                "@discordjs/voice": c.voice, "../environment": { environment: { botId: "1" } },
                "../discord": { client: { guilds: { fetch: async () => f.guild } } },
                "../persistence": { configRepo: { set: async (value) => writes.push(value) } },
                "../services/logger": { __esModule: true, default: f.logger }, "./connectToChannel": c.connect,
            });
            const config = { guildId: f.guild.id, voiceChannelId: selection === "persisted" ? f.channel.id : "other" };
            f.member.voice.channel = f.channel;
            assert.equal(await getVoiceConnection(config, selection === "member" ? f.member : undefined), c.connection);
            assert.equal(c.joins(), 1);
            assert.equal(f.requests(), type === ChannelType.GuildStageVoice ? 1 : 0);
            c.setActive(c.connection);
            assert.equal(await getVoiceConnection(config), c.connection);
            assert.equal(c.joins(), 1);
            c.setActive(undefined);
            await getVoiceConnection({ ...config, voiceChannelId: f.channel.id });
            assert.equal(c.joins(), 2);
            assert.equal(f.requests(), type === ChannelType.GuildStageVoice ? 2 : 0);
        }
    }
});

test("permissions use channel overwrites and do not require Stage speaking or request permissions", () => {
    const { hasVoicePermissions, REQUESTED_PERMISSIONS } = loadModule("services/permissions.js", { "../discord": { client: {} } });
    const f = fixture();
    const allowed = new Set([PermissionFlagsBits.Connect]);
    f.channel.permissionsFor = () => ({ has: (bits) => bits.every((bit) => allowed.has(bit)) });
    assert.equal(hasVoicePermissions(f.channel), true);
    f.channel.type = ChannelType.GuildVoice;
    assert.equal(hasVoicePermissions(f.channel), false);
    allowed.add(PermissionFlagsBits.Speak);
    assert.equal(hasVoicePermissions(f.channel), true);
    allowed.delete(PermissionFlagsBits.Connect);
    assert.equal(hasVoicePermissions(f.channel), false);
    assert.ok(REQUESTED_PERMISSIONS.includes(PermissionFlagsBits.RequestToSpeak));
    assert.ok(!REQUESTED_PERMISSIONS.includes(PermissionFlagsBits.MuteMembers));
});


function audio(f) {
    let downloads = 0;
    let plays = 0;
    let afterDownload = () => {};
    const { EventEmitter } = require("node:events");
    const speak = loadModule("speak.js", {
        "@discordjs/voice": {
            AudioPlayerStatus: { Idle: "idle" },
            createAudioResource: (filename) => filename,
            createAudioPlayer: () => {
                const player = new EventEmitter();
                player.play = () => { plays += 1; queueMicrotask(() => player.emit("idle")); };
                player.stop = () => {};
                return player;
            },
        },
        "./environment": { environment: { logging: { speak: false } } },
        "./discord": { client: { channels: { fetch: async () => f.channel } } },
        "./util/stageVoice": f.stage,
        "./util/download": { download: async () => { downloads += 1; afterDownload(); return "audio.mp3"; } },
        "google-tts-api": { getAudioUrl: () => "https://example.invalid/audio" },
        "./services/logger": { __esModule: true, default: f.logger },
    });
    const connection = { joinConfig: { guildId: "guild", channelId: f.channel.id }, subscribe: () => ({ unsubscribe() {} }) };
    return { speak, connection, downloads: () => downloads, plays: () => plays, afterDownload: (fn) => { afterDownload = fn; } };
}

test("central playback skips suppressed announcements and resumes without replaying missed ones", async () => {
    const f = fixture();
    const a = audio(f);
    await a.speak.speakCommand("skip", { nextAthlete: "A" }, a.connection, "en");
    assert.equal(a.downloads(), 0);
    f.voice.suppress = false;
    await a.speak.speakCommand("skip", { nextAthlete: "A" }, a.connection, "en");
    assert.equal(a.plays(), 1);
    f.voice.suppress = true;
    await a.speak.speak("audience again", "en", a.connection);
    assert.equal(a.plays(), 1);
    f.voice.suppress = false;
    a.afterDownload(() => { f.voice.suppress = true; });
    await a.speak.speak("demoted during download", "en", a.connection);
    assert.equal(a.plays(), 1);
    f.channel.type = ChannelType.GuildVoice;
    await a.speak.speak("regular voice", "en", a.connection);
    assert.equal(a.plays(), 2);
    assert.equal(f.requests(), 0);
});

test("timer advances and updates status while suppressed, then announces after approval", async () => {
    const f = fixture();
    const a = audio(f);
    let now = 10;
    let timer = { guildId: "guild", nextChangeTime: 10, currentAthleteIndex: 0, started: true, disabledAthletes: [] };
    let statusUpdates = 0;
    let removals = 0;
    const errors = [];
    const scheduled = [];
    f.channel.members = new Collection([["listener", { id: "listener" }]]);
    const config = { guildId: "guild", languageKey: "en", athletes: [{ name: "A", time: 30 }, { name: "B", time: 30 }] };
    const { startTimerLoop } = loadModule("timerLoop.js", {
        "./constants": { EMPTY_VC_TIMEOUT: 3600 },
        "./discord": { client: { user: { id: "bot" }, channels: { fetch: async () => f.channel } } },
        "./persistence": {
            configRepo: { get: async () => config },
            timerRepo: {
                getAll: async () => [timer],
                update: async (_id, update) => { timer = update(timer); },
                remove: async () => { removals += 1; },
            },
        },
        "./services/logger": { __esModule: true, default: { ...f.logger, error: (...args) => errors.push(args) } },
        "./services/permissions": loadModule("services/permissions.js", { "../discord": { client: {} } }),
        "./services/statusMessage": { updateStatusMessage: async () => { statusUpdates += 1; } },
        "./services/timer": { getNextAthleteIndex: () => 1, stopTimer: async () => { removals += 1; } },
        "./speak": a.speak,
        "./util/getVoiceConnection": { getVoiceConnection: async () => a.connection },
        "./util/time": { getTime: () => now },
    }, { setTimeout: (fn) => { scheduled.push(fn); } });
    startTimerLoop();
    await new Promise(setImmediate);
    assert.equal(timer.currentAthleteIndex, 1);
    assert.equal(timer.nextChangeTime, 40);
    assert.equal(statusUpdates, 1);
    assert.equal(a.plays(), 0);
    assert.equal(a.downloads(), 0);
    f.voice.suppress = false;
    now = 40;
    await scheduled.shift()();
    await new Promise(setImmediate);
    assert.equal(timer.nextChangeTime, 70);
    assert.equal(statusUpdates, 2);
    assert.equal(a.plays(), 1);
    assert.equal(removals, 0);
    assert.deepEqual(errors, []);
});

test("start reports Stage approval is needed but still starts the timer", async () => {
    const f = fixture();
    const c = connections(f);
    const replies = [];
    let starts = 0;
    f.guild.channels = { fetch: async () => f.channel };
    const { start } = loadModule("handlers/interactionCreate/start.js", {
        "../../constants": { SLASH_COMMAND: { name: "timer" } },
        "../../persistence": { configRepo: { get: async () => ({ guildId: "guild" }) }, timerRepo: { exists: async () => false } },
        "../../services/logger": { __esModule: true, default: f.logger },
        "../../services/permissions": loadModule("services/permissions.js", { "../discord": { client: {} } }),
        "../../services/timer": { addTimer: async () => { starts += 1; } },
        "../../util/getVoiceConnection": { getVoiceConnection: async () => c.connection },
        "../../util/stageVoice": f.stage,
    });
    await start({ guild: f.guild, member: f.member, reply: async (message) => replies.push(message) }, {});
    assert.equal(starts, 1);
    assert.match(replies[0], /Timer started.*moderator.*speaker/);
    assert.equal(c.destroyed(), 0);
});
