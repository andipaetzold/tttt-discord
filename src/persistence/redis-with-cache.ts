import { RedisClient } from "./redis";

/**
 * Caches data in memory to reduce the number of redis calls.
 * Assumes redis is not changed by other processes.
 */
class RedisClientWithCache extends RedisClient {
    #cache = new Map<string, any>();

    async write<T = any>(key: string, value: T): Promise<void> {
        await super.write<T>(key, value);
        this.#cache.set(key, value);
    }

    async read<T = any>(key: string): Promise<T | undefined> {
        if (this.#cache.has(key)) {
            return this.#cache.get(key);
        }

        const redisResult = await super.read<T>(key);
        if (redisResult !== undefined) {
            this.#cache.set(key, redisResult);
        }
        return redisResult;
    }

    async readMany<T = any>(keys: string[]): Promise<(T | undefined)[]> {
        const cachedValues = keys.map((key) => this.#cache.get(key));
        if (cachedValues.every((value) => value !== undefined)) {
            return cachedValues.map(([, value]) => value);
        }

        const redisResults = await super.readMany<T>(keys);
        for (const [i, redisResult] of redisResults.entries()) {
            if (redisResult !== undefined) {
                this.#cache.set(keys[i], redisResult);
            }
        }
        return redisResults;
    }

    async remove(key: string): Promise<void> {
        await super.remove(key);
        this.#cache.delete(key);
    }

    async exists(key: string): Promise<boolean> {
        if (this.#cache.has(key)) {
            return true;
        }

        return await super.exists(key);
    }
}

export const redisClient = new RedisClientWithCache();
