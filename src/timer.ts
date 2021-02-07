import { TextChannel } from "discord.js";
import { getConfig } from "./config";
import { client } from "./discord";
import { log } from "./log";
import { createTimerKey, keys, read, readMany, remove, write } from "./redis";
import { speakCommand } from "./speak";
import { createStatusMessage } from "./status";
import { Timer } from "./types";
import { EMOJI_PLUS10, EMOJI_SKIP } from "./util/emojis";
import { getVoiceConnection } from "./util/getVoiceConnection";
import { getTime } from "./util/time";

const INTERVAL = 750;

export function startTimer() {
    log("Starting timer", "Server");
    let prevTickTime: number = getTime();
    setInterval(async () => {
        const time = getTime();

        if (time !== prevTickTime) {
            const timerKeys = await keys(createTimerKey("*"));
            const timers = await readMany<Timer>(timerKeys);

            for (const timer of Object.values(timers)) {
                if (timer) {
                    tick(timer, time);
                }
            }
        }

        prevTickTime = time;
    }, INTERVAL);
}

export async function addTimer(guildId: string, channel: TextChannel): Promise<void> {
    const config = await getConfig(guildId);
    const now = getTime();

    const timer: Timer = {
        guildId,
        nextChangeTime: now + (config.startDelay === 0 ? config.athletes[0].time : config.startDelay),
        athleteIndex: 0,
        started: config.startDelay === 0,
    };

    const message = await channel.send(createStatusMessage(config, timer));
    message.react(EMOJI_PLUS10);
    message.react(EMOJI_SKIP);

    timer.status = {
        channelId: channel.id,
        messageId: message.id,
    };
    await write(createTimerKey(guildId), timer);
}

export async function updateTimer(timer: Timer): Promise<void> {
    await write(createTimerKey(timer.guildId), timer);

    if (timer.status) {
        const config = await getConfig(timer.guildId);
        const channel = (await client.channels.fetch(timer.status.channelId)) as TextChannel;
        const message = await channel.messages.fetch(timer.status.messageId);
        await message.edit(createStatusMessage(config, timer));
    }
}

export async function stopTimer(guildId: string): Promise<void> {
    const timer = await read<Timer>(createTimerKey(guildId));
    await remove(createTimerKey(guildId));

    if (timer?.status) {
        const channel = (await client.channels.fetch(timer.status.channelId)) as TextChannel;
        const message = await channel.messages.fetch(timer.status.messageId);
        await message.delete();
    }
}

export async function getTimer(guildId: string): Promise<Timer | undefined> {
    return await read(createTimerKey(guildId));
}

/**
 * - Do not await `speakCommand`
 */
async function tick(timer: Timer, now: number): Promise<void> {
    const config = await getConfig(timer.guildId);
    const connection = await getVoiceConnection(config);

    if (connection === undefined) {
        await stopTimer(timer.guildId);
        return;
    }

    let nextAthleteIndex: number;
    let nextAthleteName: string;
    const remainingSeconds = Math.max(timer.nextChangeTime - now, 0);

    if (timer.started) {
        nextAthleteIndex = (timer.athleteIndex + 1) % config.athletes.length;
        nextAthleteName = config.athletes[nextAthleteIndex].name;
    } else {
        nextAthleteIndex = timer.athleteIndex;
        nextAthleteName = config.athletes[timer.athleteIndex].name;
    }

    if (remainingSeconds === 0) {
        await updateTimer({
            ...timer,
            athleteIndex: nextAthleteIndex,
            nextChangeTime: now + config.athletes[nextAthleteIndex].time,
            started: true,
        });
    }
    speakCommand(remainingSeconds.toString(), { nextAthlete: nextAthleteName, started: timer.started }, connection);
}
