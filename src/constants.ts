import dotenv from "dotenv";

dotenv.config();

export const BOT_ID = process.env.BOT_ID ?? "1";
export const MAIN_BOT = BOT_ID === "1";

export const DEFAULT_PREFIX = MAIN_BOT ? "!t" : `!t${BOT_ID}`;
export const PREFIXES = ["!t", "!tttt"].map((prefix) => (MAIN_BOT ? prefix : `${prefix}${BOT_ID}`));

export const DEFAULT_ATHLETE_NAMES = ["Amelia", "Bowie", "Coco", "Dan", "Emma", "Finn", "Grace", "Henry", "Irene", "Jack"];

export const DEFAULT_START_DELAY = 0;
export const DEFAULT_TIME_PER_ATHLETE = 30;

export const EMPTY_VC_TIMEOUT = 60 * 60; // 60 minutes

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const SENTRY_DSN = process.env.SENTRY_DSN;
export const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT ?? "production";
export const LOG_SPEAK = process.env.LOG_SPEAK === "true";
export const REDIS_URL = process.env.REDIS_URL;
