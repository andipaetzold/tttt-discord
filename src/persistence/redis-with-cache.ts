import { RedisClient } from "./redis";

/**
 * Caches data in memory to reduce the number of redis calls.
 * Assumes redis is not changed by other processes.
 */
class RedisClientWithDataCache extends RedisClient {
    #dataCache = new Map<string, any>();

    async write<T = any>(key: string, value: T): Promise<void> {
        await super.write<T>(key, value);
        this.#dataCache.set(key, value);
    }

    async read<T = any>(key: string): Promise<T | undefined> {
        if (this.#dataCache.has(key)) {
            return this.#dataCache.get(key);
        }

        const redisResult = await super.read<T>(key);
        if (redisResult !== undefined) {
            this.#dataCache.set(key, redisResult);
        }
        return redisResult;
    }

    async readMany<T = any>(keys: string[]): Promise<(T | undefined)[]> {
        const cachedValues = keys.map((key) => this.#dataCache.get(key));
        if (cachedValues.every((value) => value !== undefined)) {
            return cachedValues.map(([, value]) => value);
        }

        const redisResults = await super.readMany<T>(keys);
        for (const [i, redisResult] of redisResults.entries()) {
            if (redisResult !== undefined) {
                this.#dataCache.set(keys[i], redisResult);
            }
        }
        return redisResults;
    }

    async remove(key: string): Promise<void> {
        await super.remove(key);
        this.#dataCache.delete(key);
    }

    async exists(key: string): Promise<boolean> {
        if (this.#dataCache.has(key)) {
            return true;
        }

        return await super.exists(key);
    }
}

class RedisClientWithKeysCache extends RedisClientWithDataCache {
    #keysCache = new Map<string, string[]>();

    async write<T = any>(key: string, value: T): Promise<void> {
        await super.write<T>(key, value);
        this.#keysCache.clear();
    }

    async remove(key: string): Promise<void> {
        await super.remove(key);
        this.#keysCache.clear();
    }

    async keys(pattern: string): Promise<string[]> {
        if (this.#keysCache.has(pattern)) {
            return this.#keysCache.get(pattern)!;
        }

        const redisResult = await super.keys(pattern);
        this.#keysCache.set(pattern, redisResult);
        return redisResult;
    }
}

export const redisClient = new RedisClientWithKeysCache();
