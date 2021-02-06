import { DEFAULT_ATHLETE_NAMES, DEFAULT_START_DELAY, DEFAULT_TIME_PER_ATHLETE } from "./constants";

export interface Config {
    startDelay: number;
    athletes: {
        name: string;
        time: number;
    }[];
}

const DEFAULT_CONFIG: Config = {
    startDelay: DEFAULT_START_DELAY,
    athletes: DEFAULT_ATHLETE_NAMES.slice(0, 6).map((name) => ({
        name,
        time: DEFAULT_TIME_PER_ATHLETE,
    })),
};

const store: Record<string, Config> = {};

export async function getConfig(guidId: string): Promise<Config> {
    const config = store[guidId] ?? DEFAULT_CONFIG;
    return Promise.resolve(config);
}

export async function saveConfig(guidId: string, config: Config): Promise<void> {
    store[guidId] = config;
}
