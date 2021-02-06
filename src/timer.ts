import { client } from "./client";
import { getConfig } from "./config";
import { speakCommand } from "./speak";

interface Timer {
    guildId: string;
    lastChangeTime: number;
    athleteIndex: number;
    started: boolean;
}

const timers: { [guildId: string]: Timer } = {};

let prevTickTime: number = getTime();
setInterval(() => {
    const time = getTime();

    if (time !== prevTickTime) {
        for (const timer of Object.values(timers)) {
            tick(timer, time);
        }
    }

    prevTickTime = time;
}, 500);

export async function addTimer(guildId: string): Promise<void> {
    const config = await getConfig(guildId);

    const now = getTime();
    timers[guildId] = {
        guildId,
        lastChangeTime: now,
        athleteIndex: 0,
        started: config.startDelay === 0,
    };
}

export async function stopTimer(guildId: string): Promise<void> {
    delete timers[guildId];
}

async function tick(timer: Timer, time: number): Promise<void> {
    const config = await getConfig(timer.guildId);
    const connection = client.voice?.connections.find((c) => c.channel.guild.id === timer.guildId);

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

        if (remainingSeconds === 0) {
            timer.athleteIndex = nextAthleteIndex;
            timer.lastChangeTime = time;
        }
    } else {
        const nextAthlete = config.athletes[timer.athleteIndex].name;
        const remainingSeconds = config.startDelay - timeSinceLastChange;

        if (remainingSeconds === 0) {
            timer.started = true;
            timer.lastChangeTime = time;

            await speakCommand("start", { nextAthlete }, connection);
        } else {
            await speakCommand(`${remainingSeconds}`, { nextAthlete }, connection);
        }
    }
}

function getTime() {
    return Math.round(Date.now() / 1_000);
}
