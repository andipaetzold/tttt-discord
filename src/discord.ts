import {
    ActivityType,
    type CacheWithLimitsOptions,
    Client,
    IntentsBitField,
    Options,
    Partials,
} from "discord.js";

const CACHE_SWEEP_INTERVAL = 5 * 60; // 5 minutes

const isClientUser = ({ client, id }: { client: Client; id: string }) => client.user?.id === id;

const cacheLimits = {
    ...Options.DefaultMakeCacheSettings,
    GuildMemberManager: {
        // Unbounded by default.
        maxSize: 200,
        keepOverLimit: (member) => isClientUser(member) || member.voice.channelId !== null,
    },
    UserManager: {
        // Unbounded by default.
        maxSize: 1_000,
        keepOverLimit: isClientUser,
    },
    VoiceStateManager: {
        // Unbounded by default.
        maxSize: 200,
        keepOverLimit: (voiceState) => isClientUser(voiceState) || voiceState.channelId !== null,
    },
} satisfies CacheWithLimitsOptions;

export const client = new Client({
    makeCache: Options.cacheWithLimits(cacheLimits),
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
    partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User],
    sweepers: {
        ...Options.DefaultSweeperSettings,
        guildMembers: {
            interval: CACHE_SWEEP_INTERVAL, // 5 minutes
            filter: () => (member) => !isClientUser(member) && member.voice.channelId === null,
        },
        messages: {
            interval: CACHE_SWEEP_INTERVAL, // 5 minutes
            lifetime: 30 * 60, // 30 minutes
        },
        users: {
            interval: CACHE_SWEEP_INTERVAL, // 5 minutes
            filter: () => (user) => !isClientUser(user),
        },
        voiceStates: {
            interval: CACHE_SWEEP_INTERVAL, // 5 minutes
            filter: () => (voiceState) => !isClientUser(voiceState) && voiceState.channelId === null,
        },
    },
});
