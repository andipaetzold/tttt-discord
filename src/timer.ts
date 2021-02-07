import { getConfig } from "./config";
import { createTimerKey, keys, readMany, remove, write } from "./redis";
import { speakCommand } from "./speak";
import { getVoiceConnection } from "./util/getVoiceConnection";

interface Timer {
    guildId: string;
    lastChangeTime: number;
    athleteIndex: number;
    started: boolean;
}

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
}, 500);

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

async function tick(timer: Timer, time: number): Promise<void> {
    const config = await getConfig(timer.guildId);
    const connection = await getVoiceConnection(config);

    if (connection === undefined) {
        stopTimer(timer.guildId);
        return;
    }

    const timeSinceLastChange = time - timer.lastChangeTime;

    if (timer.started) {
        const nextAthleteIndex = (timer.athleteIndex + 1) % config.athletes.length;
        const nextAthlete = config.athletes[nextAthleteIndex].name;
        const remainingSeconds = config.athletes[timer.athleteIndex].time - timeSinceLastChange;
        await speakCommand(`${remainingSeconds}`, { nextAthlete }, connection);

        if (remainingSeconds <= 0) {
            updateTimer({
                ...timer,
                athleteIndex: nextAthleteIndex,
                lastChangeTime: time,
            });
        }
    } else {
        const nextAthlete = config.athletes[timer.athleteIndex].name;
        const remainingSeconds = config.startDelay - timeSinceLastChange;

        if (remainingSeconds <= 0) {
            updateTimer({
                ...timer,
                started: true,
                lastChangeTime: time,
            });

            await speakCommand("start", { nextAthlete }, connection);
        } else {
            await speakCommand(`${remainingSeconds}`, { nextAthlete }, connection);
        }
    }
}

function getTime() {
    return Math.round(Date.now() / 1_000);
}
