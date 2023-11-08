import { BOT_ID, DEFAULT_ATHLETE_NAMES, DEFAULT_START_DELAY, DEFAULT_TIME_PER_ATHLETE, MAIN_BOT } from "../constants";
import { redisClient } from "./redis-with-cache";
import type { Config } from "../types";

const DEFAULT_CONFIG: Omit<Config, "guildId"> = {
    startDelay: DEFAULT_START_DELAY,
    athletes: DEFAULT_ATHLETE_NAMES.slice(0, 6).map((name) => ({
        name,
        time: DEFAULT_TIME_PER_ATHLETE,
    })),
    languageKey: "en",
};

function createConfigKey(guildId: string): string {
    return MAIN_BOT ? `config:${guildId}` : `config:${guildId}:${BOT_ID}`;
}

export async function getConfig(guildId: string): Promise<Config> {
    const config = await redisClient.read(createConfigKey(guildId));
    return {
        ...DEFAULT_CONFIG,
        ...(config ? config : {}),
        guildId,
    };
}

export async function setConfig(config: Config): Promise<void> {
    await redisClient.write(createConfigKey(config.guildId), config);
}

export async function configExists(guildId: string): Promise<boolean> {
    return await redisClient.exists(createConfigKey(guildId));
}

export async function removeConfig(guildId: string): Promise<void> {
    return await redisClient.remove(createConfigKey(guildId));
}
