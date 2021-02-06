import { client } from "./client";
import { Config, getConfig } from "./config";
import { speak, speakCommand } from "./speak";

let prevTickTime: number = Date.now();

interface Timer {
    guildId: string;
    lastChangeTime: number;
    athleteIndex: number;
    config: Config;
    started: boolean;
}

const timers: Record<string, Timer> = {};

setInterval(() => {
    const now = Date.now();

    for (const timer of Object.values(timers)) {
        const connection = client.voice?.connections.find((c) => c.channel.guild.id === timer.guildId);

        if (connection === undefined) {
            stopTimer(timer.guildId);
            return;
        }

        const secondsSinceLastChange = Math.round((now - timer.lastChangeTime) / 1_000);
        const prevSecondsSinceLastChange = Math.round((prevTickTime - timer.lastChangeTime) / 1_000);

        if (secondsSinceLastChange === prevSecondsSinceLastChange) {
            return;
        }

        if (timer.started) {
            const nextAthleteIndex = (timer.athleteIndex + 1) % timer.config.athletes.length;
            const nextAthlete = timer.config.athletes[nextAthleteIndex];
            const remainingSeconds = nextAthlete.time - secondsSinceLastChange;
            speakCommand(`${remainingSeconds}`, { nextAthlete: nextAthlete.name }, connection);

            if (remainingSeconds === 0) {
                timer.athleteIndex = nextAthleteIndex;
                timer.lastChangeTime = now;
            }
        } else {
            const nextAthlete = timer.config.athletes[timer.athleteIndex];
            const remainingSeconds = timer.config.startDelay - secondsSinceLastChange;

            if (remainingSeconds === 0) {
                timer.started = true;
                timer.lastChangeTime = now;

                speakCommand("start", { nextAthlete: nextAthlete.name }, connection);
            } else {
                speakCommand(`${remainingSeconds}`, { nextAthlete: nextAthlete.name }, connection);
            }
        }
    }

    prevTickTime = Date.now();
}, 500);

export async function addTimer(guildId: string): Promise<void> {
    const config = await getConfig(guildId);

    const now = Date.now();
    timers[guildId] = {
        guildId,
        lastChangeTime: now,
        athleteIndex: 0,
        config,
        started: config.startDelay === 0,
    };
}

export async function stopTimer(guildId: string): Promise<void> {
    delete timers[guildId];
}
