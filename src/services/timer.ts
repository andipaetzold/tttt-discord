import { getConfig } from "../config";
import { speakCommand } from "../speak";
import { Timer } from "../types";
import { getVoiceConnection } from "../util/getVoiceConnection";
import { getTime } from "../util/time";
import { createTimerKey, exists, read, write } from "./redis";

export async function skipCurrentAthlete(guildId: string): Promise<void> {
    const [timer, config] = await Promise.all([getTimer(guildId), getConfig(guildId)]);

    if (timer === undefined || config === undefined) {
        return;
    }

    const nextAthleteIndex = timer.started ? (timer.athleteIndex + 1) % config.athletes.length : timer.athleteIndex;
    await setTimer({
        ...timer,
        nextChangeTime: getTime() + config.athletes[nextAthleteIndex].time,
        athleteIndex: nextAthleteIndex,
        started: true,
    });

    const voiceConnection = await getVoiceConnection(config);
    if (voiceConnection) {
        await speakCommand("skip", { nextAthlete: config.athletes[nextAthleteIndex].name }, voiceConnection);
    }
}

export async function addTimeToCurrentAthlete(guildId: string, time: number) {
    const timer = await getTimer(guildId);
    if (timer === undefined) {
        return;
    }

    await setTimer({
        ...timer,
        nextChangeTime: timer.nextChangeTime + time,
    });
}

export async function hasTimer(guildId: string): Promise<boolean> {
    return await exists(createTimerKey(guildId));
}

export async function setTimer(timer: Timer): Promise<void> {
    await write(createTimerKey(timer.guildId), timer);
}

export async function getTimer(guildId: string): Promise<Timer | undefined> {
    return await read(createTimerKey(guildId));
}
