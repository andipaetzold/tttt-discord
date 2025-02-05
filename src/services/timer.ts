import { TextChannel } from "discord.js";
import { configRepo } from "../persistence";
import { timerRepo } from "../persistence";
import { speakCommand } from "../speak";
import { Athlete, Config, Timer } from "../types";
import { getVoiceConnection } from "../util/getVoiceConnection";
import { getTime } from "../util/time";
import { deleteStatusMessage, sendStatusMessage } from "./statusMessage";
import { type Scope } from "@sentry/node";
import isSameAthlete from "../util/isSameAthlete";

export async function skipCurrentAthlete(guildId: string): Promise<void> {
    const [timer, config] = await Promise.all([timerRepo.get(guildId), configRepo.get(guildId)]);
    if (timer === undefined || config === undefined) {
        return;
    }

    const nextAthleteIndex = getNextAthleteIndex(config, timer);
    await timerRepo.update(guildId, (t) => ({
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
    await timerRepo.update(guildId, (t) => ({
        ...t,
        nextChangeTime: t.nextChangeTime + time,
    }));
}

export async function setAthleteAsToast(guildId: string, athleteToToast: Pick<Athlete, "name" | "userId">) {
    const timer = await timerRepo.update(guildId, (t) => ({
        ...t,
        disabledAthletes: [...t.disabledAthletes, athleteToToast],
    }));

    if (timer !== undefined) {
        const config = await configRepo.get(guildId);
        const currentAthlete = config.athletes[timer.currentAthleteIndex];
        if (isSameAthlete(currentAthlete, athleteToToast)) {
            await skipCurrentAthlete(guildId);
        }
    }
}

export async function setAthleteAsFresh(guildId: string, athleteToFresh: Pick<Athlete, "name" | "userId">) {
    await timerRepo.update(guildId, (t) => ({
        ...t,
        disabledAthletes: t.disabledAthletes.filter((disabledAthlete) => !isSameAthlete(disabledAthlete, athleteToFresh)),
    }));
}

export async function addTimer(guildId: string, channel: TextChannel, scope: Scope): Promise<void> {
    if (await timerRepo.exists(guildId)) {
        return;
    }

    const config = await configRepo.get(guildId);
    const now = getTime();

    const timer: Timer = {
        guildId,
        nextChangeTime: now + (config.startDelay === 0 ? config.athletes[0].time : config.startDelay),
        currentAthleteIndex: 0,
        started: config.startDelay === 0,
        disabledAthletes: [],
    };

    await timerRepo.set(timer);
    await sendStatusMessage(channel, scope);
}

export async function stopTimer(guildId: string, scope: Scope): Promise<void> {
    await deleteStatusMessage(guildId, scope);
    await timerRepo.remove(guildId);
}

export function isDisabledAthlete(timer: Timer, athlete: Pick<Athlete, "name" | "userId">): boolean {
    return !!timer.disabledAthletes.find((disabledAthlete) => isSameAthlete(athlete, disabledAthlete));
}
