export const environment = {
    botId: process.env.BOT_ID ?? "1",
    mainBot: process.env.BOT_ID === "1",
    discord: {
        token: process.env.DISCORD_TOKEN,
    },
    sentry: {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SENTRY_ENVIRONMENT ?? "production",
    },
    logging: {
        speak: process.env.LOG_SPEAK === "true",
    },
    redis: {
        url: process.env.REDIS_URL,
    },
};

if (!environment.discord.token) {
    throw new Error("DISCORD_TOKEN is required");
}

if (!environment.redis.url) {
    throw new Error("REDIS_URL is required");
}
