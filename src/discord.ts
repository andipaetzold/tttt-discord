import { ActivityType, Client, IntentsBitField, Partials } from "discord.js";

export const client = new Client({
    presence: {
        afk: false,
        activities: [
            {
                name: "WTRL on Zwift",
                type: ActivityType.Competing,
            },
        ],
        status: "online",
    },
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.DirectMessages,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});
