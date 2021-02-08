import { TextChannel } from "discord.js";
import { getConfig } from "./config";
import { log } from "./services/log";
import { createTimerKey, keys, read, readMany, remove, write } from "./services/redis";
import { deleteStatusMessage, sendStatusMessage, updateStatusMessage } from "./services/statusMessage";
import { setTimer } from "./services/timer";
import { speakCommand } from "./speak";
import { Timer } from "./types";
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

    await write(createTimerKey(guildId), timer);
    await sendStatusMessage(channel);
}

export async function updateTimer(timer: Timer): Promise<void> {
    await setTimer(timer);
    await updateStatusMessage(timer.guildId);
}

export async function stopTimer(guildId: string): Promise<void> {
    await deleteStatusMessage(guildId);
    await remove(createTimerKey(guildId));
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
