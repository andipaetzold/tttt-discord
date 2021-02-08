import { DEFAULT_ATHLETE_NAMES, DEFAULT_START_DELAY, DEFAULT_TIME_PER_ATHLETE } from "./constants";
import { createConfigKey, read, remove, write } from "./services/redis";
import { Config } from "./types";

const DEFAULT_CONFIG: Omit<Config, "guildId"> = {
    startDelay: DEFAULT_START_DELAY,
    athletes: DEFAULT_ATHLETE_NAMES.slice(0, 6).map((name) => ({
        name,
        time: DEFAULT_TIME_PER_ATHLETE,
    })),
};

export async function getConfig(guildId: string): Promise<Config> {
    const config = await read(createConfigKey(guildId));
    return (
        config ?? {
            ...DEFAULT_CONFIG,
            guildId,
        }
    );
}

export async function saveConfig(config: Config): Promise<void> {
    await write(createConfigKey(config.guildId), config);
}

export async function removeConfig(guildId: string): Promise<void> {
    await remove(createConfigKey(guildId));
}
