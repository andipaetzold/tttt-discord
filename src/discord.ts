import { Client } from "discord.js";

export const client = new Client({
    presence: {
        afk: false,
        activities: [
            {
                name: "WTRL on Zwift",
                type: "COMPETING",
            },
        ],
        status: "online",
    },
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_VOICE_STATES", "DIRECT_MESSAGES"],
    partials: ["REACTION", "MESSAGE"],
});
