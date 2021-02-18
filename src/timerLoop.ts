import { performance } from "perf_hooks";
import { client } from "./discord";
import { getConfig } from "./persistence/config";
import { getAllTimers, removeTimer, setTimer } from "./persistence/timer";
import logger from "./services/logger";
import { hasVoicePermissions } from "./services/permissions";
import { updateStatusMessage } from "./services/statusMessage";
import { getNextAthleteIndex } from "./services/timer";
import { speakCommand } from "./speak";
import { Timer } from "./types";
import { getVoiceConnection } from "./util/getVoiceConnection";
import { getTime } from "./util/time";

const INTERVAL = 1_000;

let timerLoopStart: number;
export function startTimerLoop() {
    logger.info(undefined, "Starting timer loop");

    timerLoopStart = performance.now();
    scheduleTick();
}

/**
 * @source: https://gist.github.com/jakearchibald/cb03f15670817001b1157e62a076fe95
 */
async function scheduleTick() {
    await tick();

    const now = performance.now();
    const elapsed = now - timerLoopStart;
    const roundedElapsed = Math.round(elapsed / INTERVAL) * INTERVAL;
    const targetNext = timerLoopStart + roundedElapsed + INTERVAL;
    const delay = targetNext - performance.now();
    setTimeout(scheduleTick, delay);
}

let prevTickTime: number | undefined;
async function tick() {
    const time = getTime();
    if (time !== prevTickTime) {
        const timers = await getAllTimers();
        timers.filter((timer): timer is Timer => timer !== undefined).forEach((timer) => tickTimer(timer, time));
    }
    prevTickTime = time;
}

/**
 * - Do not await `speakCommand`
 */
async function tickTimer(timer: Timer, now: number): Promise<void> {
    try {
        const config = await getConfig(timer.guildId);
        const connection = await getVoiceConnection(config);

        if (connection === undefined) {
            throw new Error("Could not get voice connection");
        }

        const guild = await client.guilds.fetch(timer.guildId);
        if (!hasVoicePermissions(guild)) {
            throw new Error("Missing voice permissions");
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
        speakCommand(
            remainingSeconds.toString(),
            { nextAthlete: nextAthleteName, started: timer.started },
            connection,
            config.languageKey
        );
    } catch (e) {
        logger.error("Stopping timer due to an error", `G:${timer.guildId}`);
        logger.error(e, `G:${timer.guildId}`);
        await removeTimer(timer.guildId);
    }
}
