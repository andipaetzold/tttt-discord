import { getConfig } from "./config";
import { log } from "./log";
import { createTimerKey, keys, readMany, remove, write } from "./redis";
import { speakCommand } from "./speak";
import { getVoiceConnection } from "./util/getVoiceConnection";

const INTERVAL = 750;

interface Timer {
    guildId: string;
    lastChangeTime: number;
    athleteIndex: number;
    started: boolean;
}

export function startTimer() {
    log("Starting timer", "Server");
    let prevTickTime: number = getTime();
    setInterval(async () => {
        const time = getTime();

        if (time !== prevTickTime) {
            const timerKeys = await keys(createTimerKey("*"));
            const timers = await readMany(timerKeys);

            for (const timer of Object.values(timers)) {
                tick(timer, time);
            }
        }

        prevTickTime = time;
    }, INTERVAL);
}

export async function addTimer(guildId: string): Promise<void> {
    const config = await getConfig(guildId);

    const now = getTime();
    await write(createTimerKey(guildId), {
        guildId,
        lastChangeTime: now,
        athleteIndex: 0,
        started: config.startDelay === 0,
    });
}

export async function updateTimer(timer: Timer): Promise<void> {
    await write(createTimerKey(timer.guildId), timer);
}

export async function stopTimer(guildId: string): Promise<void> {
    await remove(createTimerKey(guildId));
}

/**
 * - Do not await `speakCommand`
 */
async function tick(timer: Timer, time: number): Promise<void> {
    const config = await getConfig(timer.guildId);
    const connection = await getVoiceConnection(config);

    if (connection === undefined) {
        await stopTimer(timer.guildId);
        return;
    }

    const timeSinceLastChange = time - timer.lastChangeTime;

    let nextAthleteIndex: number;
    let nextAthleteName: string;
    let remainingSeconds: number;

    if (timer.started) {
        nextAthleteIndex = (timer.athleteIndex + 1) % config.athletes.length;
        nextAthleteName = config.athletes[nextAthleteIndex].name;
        remainingSeconds = Math.max(0, config.athletes[timer.athleteIndex].time - timeSinceLastChange);
    } else {
        nextAthleteIndex = timer.athleteIndex;
        nextAthleteName = config.athletes[timer.athleteIndex].name;
        remainingSeconds = Math.max(0, config.startDelay - timeSinceLastChange);
    }

    if (remainingSeconds === 0) {
        await updateTimer({
            ...timer,
            athleteIndex: nextAthleteIndex,
            lastChangeTime: time,
            started: true,
        });
    }
    speakCommand(remainingSeconds.toString(), { nextAthlete: nextAthleteName, started: timer.started }, connection);
}

function getTime() {
    return Math.round(Date.now() / 1_000);
}
