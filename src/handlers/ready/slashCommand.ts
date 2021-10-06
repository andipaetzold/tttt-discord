import { ChatInputApplicationCommandData } from "discord.js";
import range from "lodash/range";
import { BOT_ID, MAIN_BOT, SLASH_COMMAND } from "../../constants";
import { LANGUAGES } from "../../languages";

export function getSlashCommand() {
    return {
        name: `${SLASH_COMMAND.name}${MAIN_BOT ? "" : BOT_ID}`,
        ...command,
    };
}

const command: Omit<ChatInputApplicationCommandData, "name"> = {
    type: "CHAT_INPUT",
    description: "Timer",
    options: [
        {
            type: "SUB_COMMAND",
            name: SLASH_COMMAND.commands.start,
            description: "Start the timer",
        },
        {
            type: "SUB_COMMAND",
            name: SLASH_COMMAND.commands.stop,
            description: "Stop the timer",
        },
        {
            type: "SUB_COMMAND",
            name: SLASH_COMMAND.commands.help,
            description: "Help",
        },
        {
            type: "SUB_COMMAND",
            name: SLASH_COMMAND.commands.athlete.name,
            description: "Set the time of a specific athlete",
            options: [
                {
                    type: "MENTIONABLE",
                    name: SLASH_COMMAND.commands.athlete.athlete,
                    description: "The athlete to set the time for",
                    required: true,
                },
                {
                    type: "INTEGER",
                    name: SLASH_COMMAND.commands.athlete.time,
                    description: "The time to set the athlete to",
                    required: true,
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: SLASH_COMMAND.commands.language.name,
            description: "Get or set the language for the timer",
            options: [
                {
                    type: "STRING",
                    description: "The language to set",
                    name: SLASH_COMMAND.commands.language.language,
                    choices: LANGUAGES.map(({ name, key }) => ({ name, value: key })),
                    required: false,
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: SLASH_COMMAND.commands.delay.name,
            description: "Get or set the start delay",
            options: [
                {
                    type: "NUMBER",
                    name: SLASH_COMMAND.commands.delay.delay,
                    description: "Delay in seconds",
                    required: false,
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: SLASH_COMMAND.commands.athletes.name,
            description: "Get or set athletes",
            options: range(1, SLASH_COMMAND.commands.athletes.athletesCount + 1).flatMap((i) => [
                {
                    type: "MENTIONABLE",
                    name: `${SLASH_COMMAND.commands.athletes.athletesPrefix}${i}`,
                    description: `Athlete ${i}`,
                    required: false,
                },
                {
                    type: "INTEGER",
                    name: `${SLASH_COMMAND.commands.athletes.timePrefix}${i}`,
                    description: `Time in seconds for athlete ${1}`,
                    required: false,
                },
            ]),
        },
    ],
};
