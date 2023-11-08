import { RedisClient } from "./redis";

/**
 * Caches data in memory to reduce the number of redis calls.
 * Assumes redis is not changed by other processes.
 */
class RedisClientWithCache extends RedisClient {
    #cache: Record<string, any> = {};

    constructor() {
        super();
    }

    async write<T = any>(key: string, value: T): Promise<void> {
        await super.write<T>(key, value);
        this.#cache[key] = value;
    }

    async read<T = any>(key: string): Promise<T | undefined> {
        if (key in this.#cache) {
            return this.#cache[key];
        }

        const redisResult = await super.read<T>(key);
        if (redisResult !== undefined) {
            this.#cache[key] = redisResult;
        }
        return redisResult;
    }

    async readMany<T = any>(keys: string[]): Promise<(T | undefined)[]> {
        const cachedValues = keys.map((key) => this.#cache[key]);
        if (cachedValues.every((value) => value !== undefined)) {
            return cachedValues.map(([, value]) => value);
        }

        const redisResults = await super.readMany<T>(keys);
        for (const [i, redisResult] of redisResults.entries()) {
            if (redisResult !== undefined) {
                this.#cache[keys[i]] = redisResult;
            }
        }
        return redisResults;
    }

    async keys(pattern: string): Promise<string[]> {
        return await super.keys(pattern);
    }

    async remove(key: string): Promise<void> {
        await super.remove(key);
        delete this.#cache[key];
    }

    async exists(key: string): Promise<boolean> {
        if (key in this.#cache) {
            return true;
        }

        return await super.exists(key);
    }
}

export const redisClient = new RedisClientWithCache();
