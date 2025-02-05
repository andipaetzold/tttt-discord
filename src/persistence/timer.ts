import { environment } from "../environment";
import type { Timer } from "../types";
import { RedisClient } from "./redis";

export class TimerRepository {
    #redisClient: RedisClient;

    constructor(redisClient: RedisClient) {
        this.#redisClient = redisClient;
    }

    #createRedisKey(guildId: string): string {
        return `timer:${guildId}:${environment.botId}`;
    }

    async #getAllKeys(): Promise<string[]> {
        const key = this.#createRedisKey("*");
        return await this.#redisClient.keys(key);
    }

    async exists(guildId: string): Promise<boolean> {
        const key = this.#createRedisKey(guildId);
        return await this.#redisClient.exists(key);
    }

    async get(guildId: string): Promise<Timer | undefined> {
        const key = this.#createRedisKey(guildId);
        return await this.#redisClient.read(key);
    }

    async set(timer: Timer): Promise<void> {
        const key = this.#createRedisKey(timer.guildId);
        await this.#redisClient.write(key, timer);
    }

    async remove(guildId: string): Promise<void> {
        await this.#redisClient.remove(this.#createRedisKey(guildId));
    }

    async getAll(): Promise<(Timer | undefined)[]> {
        const keys = await this.#getAllKeys();
        return await this.#redisClient.readMany<Timer>(keys);
    }

    async update(guildId: string, updateFn: (timer: Timer) => Timer | undefined): Promise<Timer | undefined> {
        const oldTimer = await this.get(guildId);

        if (oldTimer === undefined) {
            return;
        }

        const newTimer = updateFn(oldTimer);
        if (newTimer === undefined) {
            await this.remove(guildId);
        } else {
            await this.set(newTimer);
        }

        return newTimer;
    }
}
