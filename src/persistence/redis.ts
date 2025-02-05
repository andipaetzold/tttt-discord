import { createClient } from "redis";
import logger from "../services/logger";

export class RedisClient {
    #client: ReturnType<typeof createClient>;
    #connected: Promise<void>;

    constructor(url: string) {
        this.#client = createClient({ url });
        this.#connected = this.#connect();
    }

    async #connect() {
        logger.info(undefined, "Connecting to redis");
        await this.#client.connect();
        logger.info(undefined, "Pinging redis");
        await this.#client.ping();
        logger.info(undefined, "Redis connection established");
    }

    async waitForConnection() {
        await this.#connected;
    }

    async write<T = any>(key: string, value: T): Promise<void> {
        const stringified = JSON.stringify(value);
        await this.#connected;
        await this.#client.set(key, stringified);
    }

    async read<T = any>(key: string): Promise<T | undefined> {
        await this.#connected;
        const value = await this.#client.get(key);
        return value ? JSON.parse(value) : undefined;
    }

    async readMany<T = any>(keys: string[]): Promise<(T | undefined)[]> {
        if (keys.length === 0) {
            return [];
        }

        await this.#connected;
        const values = await this.#client.mGet(keys);
        return values.map((value) => (value ? JSON.parse(value) : undefined));
    }

    async keys(pattern: string): Promise<string[]> {
        await this.#connected;
        return await this.#client.keys(pattern);
    }

    async remove(key: string): Promise<void> {
        await this.#connected;
        await this.#client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        await this.#connected;
        const count = await this.#client.exists(key);
        return count > 0;
    }
}
