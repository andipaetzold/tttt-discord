export const BOT_ID = process.env.BOT_ID ?? "1";
export const MAIN_BOT = BOT_ID === "1";

export const DEFAULT_ATHLETE_NAMES = ["Amelia", "Bowie", "Coco", "Dan", "Emma", "Finn", "Grace", "Henry", "Irene", "Jack"];

export const DEFAULT_START_DELAY = 0;
export const DEFAULT_TIME_PER_ATHLETE = 30;

export const EMPTY_VC_TIMEOUT = 60 * 60; // 60 minutes

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const SENTRY_DSN = process.env.SENTRY_DSN;
export const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT ?? "production";
export const LOG_SPEAK = process.env.LOG_SPEAK === "true";
export const REDIS_URL = process.env.REDIS_URL;

// validate environment variables
if (!DISCORD_TOKEN) {
    throw new Error("DISCORD_TOKEN is required");
}

if (!REDIS_URL) {
    throw new Error("REDIS_URL is required");
}

// Slash Commands
export const SLASH_COMMAND = {
    name: `timer${MAIN_BOT ? "" : BOT_ID}`,
    commands: {
        start: "start",
        stop: "stop",
        help: "help",
        athlete: {
            name: "athlete",
            athlete: "athlete",
            time: "time",
        },
        language: {
            name: "language",
            language: "language",
        },
        delay: {
            name: "delay",
            delay: "delay",
        },
        athletes: {
            name: "athletes",
            athletesCount: 8,
            athletesPrefix: "athlete",
            timePrefix: "time",
        },
        toast: {
            name: "toast",
            athlete: "athlete",
        },
        fresh: {
            name: "fresh",
            athlete: "athlete",
        },
        skip: {
            name: "skip",
        },
        plus: {
            name: "plus",
            time: "time",
        },
        reset: {
            name: "reset",
        },
    },
};
