import { DEFAULT_ATHLETE_NAMES, DEFAULT_START_DELAY, DEFAULT_TIME_PER_ATHLETE } from "../constants";
import { environment } from "../environment";
import type { Config } from "../types";
import { RedisClient } from "./redis";

const DEFAULT_CONFIG: Omit<Config, "guildId"> = {
    startDelay: DEFAULT_START_DELAY,
    athletes: DEFAULT_ATHLETE_NAMES.slice(0, 6).map((name) => ({
        name,
        time: DEFAULT_TIME_PER_ATHLETE,
    })),
    languageKey: "en",
};

export class ConfigRepository {
    #redisClient: RedisClient;

    constructor(redisClient: RedisClient) {
        this.#redisClient = redisClient;
    }

    #createRedisKey(guildId: string): string {
        return environment.mainBot ? `config:${guildId}` : `config:${guildId}:${environment.botId}`;
    }

    async exists(guildId: string): Promise<boolean> {
        const key = this.#createRedisKey(guildId);
        return await this.#redisClient.exists(key);
    }

    async get(guildId: string): Promise<Config> {
        const key = this.#createRedisKey(guildId);
        const config = await this.#redisClient.read(key);
        return {
            ...DEFAULT_CONFIG,
            ...(config ? config : {}),
            guildId,
        };
    }

    async set(config: Config): Promise<void> {
        const key = this.#createRedisKey(config.guildId);
        await this.#redisClient.write(key, config);
    }

    async remove(guildId: string): Promise<void> {
        const key = this.#createRedisKey(guildId);
        await this.#redisClient.remove(key);
    }
}
