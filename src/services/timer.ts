import { TextChannel } from "discord.js";
import { getConfig } from "../persistence/config";
import { getTimer, removeTimer, setTimer } from "../persistence/timer";
import { speakCommand } from "../speak";
import { Config, Timer } from "../types";
import { getVoiceConnection } from "../util/getVoiceConnection";
import { getTime } from "../util/time";
import { deleteStatusMessage, sendStatusMessage } from "./statusMessage";

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

    console.log(getTime());
    console.log(getTime() + config.athletes[nextAthleteIndex].time);

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

export async function addTimer(guildId: string, channel: TextChannel): Promise<void> {
    const config = await getConfig(guildId);
    const now = getTime();

    const timer: Timer = {
        guildId,
        nextChangeTime: now + (config.startDelay === 0 ? config.athletes[0].time : config.startDelay),
        currentAthleteIndex: 0,
        started: config.startDelay === 0,
        disabledAthletes: [],
    };

    await setTimer(timer);
    await sendStatusMessage(channel);
}

export async function stopTimer(guildId: string): Promise<void> {
    await deleteStatusMessage(guildId);
    await removeTimer(guildId);
}
