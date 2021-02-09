import { client } from "./discord";
import { getConfig } from "./persistence/config";
import { getAllTimers, setTimer } from "./persistence/timer";
import { log } from "./services/log";
import { hasVoicePermissions } from "./services/permissions";
import { updateStatusMessage } from "./services/statusMessage";
import { getNextAthleteIndex, stopTimer } from "./services/timer";
import { speakCommand } from "./speak";
import { Timer } from "./types";
import { getVoiceConnection } from "./util/getVoiceConnection";
import { getTime } from "./util/time";

const INTERVAL = 750;

export function startTimerLoop() {
    log("Starting timer", "Server");
    let prevTickTime: number = getTime();
    setInterval(async () => {
        const time = getTime();
        
        if (time !== prevTickTime) {
            const timers = await getAllTimers();

            for (const timer of timers) {
                if (timer) {
                    tick(timer, time);
                }
            }
        }

        prevTickTime = time;
    }, INTERVAL);
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

    const guild = await client.guilds.fetch(timer.guildId);
    if (!hasVoicePermissions(guild)) {
        log("Missing voice permissions", `G:${timer.guildId}`);
        await stopTimer(timer.guildId);
        return;
    }

    const nextAthleteIndex = getNextAthleteIndex(config, timer);
    const nextAthleteName = config.athletes[nextAthleteIndex].name;

    const remainingSeconds = Math.max(timer.nextChangeTime - now, 0);
    if (remainingSeconds === 0) {
        await setTimer({
            ...timer,
            currentAthleteIndex: nextAthleteIndex,
            nextChangeTime: now + config.athletes[nextAthleteIndex].time,
            started: true,
        });
        await updateStatusMessage(timer.guildId);
    }
    speakCommand(remainingSeconds.toString(), { nextAthlete: nextAthleteName, started: timer.started }, connection);
}
