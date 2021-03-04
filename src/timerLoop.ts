import { performance } from "perf_hooks";
import { EMPTY_VC_TIMEOUT } from "./constants";
import { client } from "./discord";
import { getConfig } from "./persistence/config";
import { getAllTimers, removeTimer, updateTimer } from "./persistence/timer";
import logger from "./services/logger";
import { hasVoicePermissions } from "./services/permissions";
import { updateStatusMessage } from "./services/statusMessage";
import { getNextAthleteIndex, stopTimer } from "./services/timer";
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

        const isVoiceChannelEmpty =
            connection.channel.members.array().filter((member) => member.id !== client.user!.id).length === 0;
        if (isVoiceChannelEmpty) {
            if (timer.voiceChannelEmptySince) {
                if (timer.voiceChannelEmptySince <= now - EMPTY_VC_TIMEOUT) {
                    logger.info(timer.guildId, "Stopping timer due to an empty voice channel");
                    await stopTimer(timer.guildId);
                    connection.disconnect();
                    return;
                }
            } else {
                logger.info(timer.guildId, "Empty voice channel");
                await updateTimer(timer.guildId, (t) => ({
                    ...t,
                    voiceChannelEmptySince: now,
                }));
            }
        } else if (timer.voiceChannelEmptySince) {
            await updateTimer(timer.guildId, (t) => ({
                ...t,
                voiceChannelEmptySince: undefined,
            }));
        }

        const nextAthleteIndex = getNextAthleteIndex(config, timer);
        const nextAthleteName = config.athletes[nextAthleteIndex].name;

        const remainingSeconds = Math.max(timer.nextChangeTime - now, 0);
        if (remainingSeconds === 0) {
            await updateTimer(timer.guildId, (t) => ({
                ...t,
                currentAthleteIndex: nextAthleteIndex,
                nextChangeTime: now + config.athletes[nextAthleteIndex].time,
                started: true,
            }));
            await updateStatusMessage(timer.guildId);
        }

        speakCommand(
            remainingSeconds.toString(),
            { nextAthlete: nextAthleteName, started: timer.started },
            connection,
            config.languageKey
        );
    } catch (e) {
        logger.error(timer.guildId, "Stopping timer due to an error");
        logger.error(timer.guildId, e);
        await removeTimer(timer.guildId);
    }
}
