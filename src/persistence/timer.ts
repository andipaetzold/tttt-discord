import deepEqual from "fast-deep-equal";
import type { Timer } from "../types";
import { exists, keys, read, readMany, remove, write } from "./redis";

function createTimerKey(guildId: string): string {
    return `timer:${guildId}`;
}

export async function getTimer(guildId: string): Promise<Timer | undefined> {
    return await read(createTimerKey(guildId));
}

export async function setTimer(timer: Timer): Promise<void> {
    await write(createTimerKey(timer.guildId), timer);
}

export async function updateTimer(guildId: string, updateFn: (timer: Timer) => Timer | undefined): Promise<Timer | undefined> {
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
    return await exists(createTimerKey(guildId));
}

export async function removeTimer(guildId: string): Promise<void> {
    return await remove(createTimerKey(guildId));
}

export async function getAllTimerKeys(): Promise<string[]> {
    return await keys(createTimerKey("*"));
}

export async function getAllTimers(): Promise<(Timer | undefined)[]> {
    return await readMany<Timer>(await getAllTimerKeys());
}
