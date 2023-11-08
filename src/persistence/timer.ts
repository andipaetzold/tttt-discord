import { BOT_ID } from "../constants";
import type { Timer } from "../types";
import { redisClient } from "./redis-with-cache";

function createTimerKey(guildId: string): string {
    return `timer:${guildId}:${BOT_ID}`;
}

export async function getTimer(guildId: string): Promise<Timer | undefined> {
    return await redisClient.read(createTimerKey(guildId));
}

export async function setTimer(timer: Timer): Promise<void> {
    await redisClient.write(createTimerKey(timer.guildId), timer);
}

export async function updateTimer(
    guildId: string,
    updateFn: (timer: Timer) => Timer | undefined
): Promise<Timer | undefined> {
    const oldTimer = await getTimer(guildId);

    if (oldTimer === undefined) {
        return;
    }

    const newTimer = updateFn(oldTimer);
    if (newTimer === undefined) {
        await removeTimer(guildId);
    } else {
        await setTimer(newTimer);
    }

    return newTimer;
}

export async function timerExists(guildId: string): Promise<boolean> {
    return await redisClient.exists(createTimerKey(guildId));
}

export async function removeTimer(guildId: string): Promise<void> {
    return await redisClient.remove(createTimerKey(guildId));
}

export async function getAllTimerKeys(): Promise<string[]> {
    return await redisClient.keys(createTimerKey("*"));
}

export async function getAllTimers(): Promise<(Timer | undefined)[]> {
    return await redisClient.readMany<Timer>(await getAllTimerKeys());
}
