import { TextChannel } from "discord.js";
import { getConfig } from "../persistence/config";
import { getTimer, removeTimer, setTimer, timerExists, updateTimer } from "../persistence/timer";
import { speakCommand } from "../speak";
import { Athlete, Config, Timer } from "../types";
import { getVoiceConnection } from "../util/getVoiceConnection";
import { getTime } from "../util/time";
import { deleteStatusMessage, sendStatusMessage } from "./statusMessage";
import * as Sentry from "@sentry/node";
import isSameAthlete from "../util/isSameAthlete";

export async function skipCurrentAthlete(guildId: string): Promise<void> {
    const [timer, config] = await Promise.all([getTimer(guildId), getConfig(guildId)]);
    if (timer === undefined || config === undefined) {
        return;
    }

    const nextAthleteIndex = getNextAthleteIndex(config, timer);
    await updateTimer(guildId, (t) => ({
        ...t,
        nextChangeTime: getTime() + config.athletes[nextAthleteIndex].time,
        currentAthleteIndex: nextAthleteIndex,
        started: true,
    }));

    const voiceConnection = await getVoiceConnection(config);
    if (voiceConnection) {
        speakCommand("skip", { nextAthlete: config.athletes[nextAthleteIndex].name }, voiceConnection, config.languageKey);
    }
}

export function getNextAthleteIndex(config: Config, timer: Timer): number {
    // All toasted?
    if (config.athletes.every((athlete) => isDisabledAthlete(timer, athlete))) {
        console.log("A");
        return timer.currentAthleteIndex;
    }

    // Who is first?
    if (!timer.started) {
        return config.athletes.findIndex((athlete) => !isDisabledAthlete(timer, athlete));
    }

    const athletesWithIndex = config.athletes.map((athlete, index) => ({ ...athlete, index }));
    return [...athletesWithIndex.slice(timer.currentAthleteIndex + 1), ...athletesWithIndex].find(
        (athlete) => !isDisabledAthlete(timer, athlete)
    )?.index!;
}

export async function addTimeToCurrentAthlete(guildId: string, time: number) {
    await updateTimer(guildId, (t) => ({
        ...t,
        nextChangeTime: t.nextChangeTime + time,
    }));
}

export async function setAthleteAsToast(guildId: string, athleteToToast: Pick<Athlete, "name" | "userId">) {
    const timer = await updateTimer(guildId, (t) => ({
        ...t,
        disabledAthletes: [...t.disabledAthletes, athleteToToast],
    }));

    if (timer !== undefined) {
        const config = await getConfig(guildId);
        const currentAthlete = config.athletes[timer.currentAthleteIndex];
        if (isSameAthlete(currentAthlete, athleteToToast)) {
            await skipCurrentAthlete(guildId);
        }
    }
}

export async function setAthleteAsFresh(guildId: string, athleteToFresh: Pick<Athlete, "name" | "userId">) {
    await updateTimer(guildId, (t) => ({
        ...t,
        disabledAthletes: t.disabledAthletes.filter((disabledAthlete) => !isSameAthlete(disabledAthlete, athleteToFresh)),
    }));
}

export async function addTimer(guildId: string, channel: TextChannel, scope: Sentry.Scope): Promise<void> {
    if (await timerExists(guildId)) {
        return;
    }

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
    await sendStatusMessage(channel, scope);
}

export async function stopTimer(guildId: string, scope: Sentry.Scope): Promise<void> {
    await deleteStatusMessage(guildId, scope);
    await removeTimer(guildId);
}

export function isDisabledAthlete(timer: Timer, athlete: Pick<Athlete, "name" | "userId">): boolean {
    return !!timer.disabledAthletes.find((disabledAthlete) => isSameAthlete(athlete, disabledAthlete));
}
