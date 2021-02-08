import { getConfig } from "../config";
import { speakCommand } from "../speak";
import { Config, Timer } from "../types";
import { getVoiceConnection } from "../util/getVoiceConnection";
import { getTime } from "../util/time";
import { createTimerKey, exists, read, write } from "./redis";

export async function skipCurrentAthlete(guildId: string): Promise<void> {
    const [timer, config] = await Promise.all([getTimer(guildId), getConfig(guildId)]);
    if (timer === undefined || config === undefined) {
        return;
    }

    const nextAthleteIndex = getNextAthleteIndex(config, timer);
    await setTimer({
        ...timer,
        nextChangeTime: getTime() + config.athletes[nextAthleteIndex].time,
        currentAthleteIndex: nextAthleteIndex,
        started: true,
    });

    const voiceConnection = await getVoiceConnection(config);
    if (voiceConnection) {
        await speakCommand("skip", { nextAthlete: config.athletes[nextAthleteIndex].name }, voiceConnection);
    }

}

export function getNextAthleteIndex(config: Config, timer: Timer): number {
    if (config.athletes.every((_, i) => timer.disabledAthletes.includes(i))) {
        return timer.currentAthleteIndex;
    }

    if (!timer.started) {
        return config.athletes.findIndex((_a, ai) => !timer.disabledAthletes.includes(ai));
    }

    const indexes = config.athletes.map((_, index) => index);
    return [...indexes.slice(timer.currentAthleteIndex + 1), ...indexes].filter(
        (ai) => !timer.disabledAthletes.includes(ai)
    )[0];
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

export async function setAthleteAsToast(guildId: string, athleteIndex: number) {
    const timer = await getTimer(guildId);
    if (timer === undefined) {
        return;
    }

    await setTimer({
        ...timer,
        disabledAthletes: [...timer.disabledAthletes, athleteIndex],
    });

    if (timer.currentAthleteIndex === athleteIndex) {
        await skipCurrentAthlete(guildId);
    }
}

export async function setAthleteAsFresh(guildId: string, athleteIndex: number) {
    const timer = await getTimer(guildId);
    if (timer === undefined) {
        return;
    }

    await setTimer({
        ...timer,
        disabledAthletes: timer.disabledAthletes.filter((ai) => ai !== athleteIndex),
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
