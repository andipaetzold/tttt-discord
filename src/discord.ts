import { Client } from "discord.js";

export const client = new Client({
    presence: {
        afk: false,
        activities: [
            {
                name: "WTRL on Zwift",
                type: "WATCHING",
            },
        ],
        status: "online",
    },
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_VOICE_STATES", "DIRECT_MESSAGES"],
});
