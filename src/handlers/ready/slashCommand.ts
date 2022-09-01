import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputApplicationCommandData } from "discord.js";
import range from "lodash/range";
import hash from "object-hash";
import { SLASH_COMMAND } from "../../constants";
import { client } from "../../discord";
import { LANGUAGES } from "../../languages";
import { getSlashCommandHash, setSlashCommandHash } from "../../persistence/command";
import logger from "../../services/logger";

export async function initCommands() {
    const applicationCommands = client.application!.commands;
    const command = getSlashCommand();

    const existingCommands = await applicationCommands.fetch();
    const existingCommand = existingCommands.find((cmd) => cmd.name === command.name);

    if (existingCommand) {
        const existingHash = await getSlashCommandHash();
        const commandHash = hash(command);

        if (existingHash === commandHash) {
            logger.info(undefined, `No need to update slash command`);
        } else {
            logger.info(undefined, `Updating slash command`);
            await applicationCommands.edit(existingCommand, command);
        }
    } else {
        logger.info(undefined, `Creating slash command`);
        await applicationCommands.create(command);
    }

    await setSlashCommandHash(command);
}

function getSlashCommand() {
    return {
        name: SLASH_COMMAND.name,
        ...command,
    };
}

const command: Omit<ChatInputApplicationCommandData, "name"> = {
    type: ApplicationCommandType.ChatInput,
    description: "Timer",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: SLASH_COMMAND.commands.start,
            description: "Start the timer",
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: SLASH_COMMAND.commands.stop,
            description: "Stop the timer",
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: SLASH_COMMAND.commands.help,
            description: "Help",
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: SLASH_COMMAND.commands.skip.name,
            description: "Skip the current athlete",
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: SLASH_COMMAND.commands.reset.name,
            description: "Stops the timer and resets all configuration",
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: SLASH_COMMAND.commands.athlete.name,
            description: "Set the time of a specific athlete",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: SLASH_COMMAND.commands.athlete.athlete,
                    description: "The athlete to set the time for",
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: SLASH_COMMAND.commands.athlete.time,
                    description: "The time to set the athlete to",
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: SLASH_COMMAND.commands.language.name,
            description: "Get or set the language for the timer",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    description: "The language to set",
                    name: SLASH_COMMAND.commands.language.language,
                    choices: LANGUAGES.map(({ name, key }) => ({ name, value: key })),
                    required: false,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: SLASH_COMMAND.commands.delay.name,
            description: "Get or set the start delay",
            options: [
                {
                    type: ApplicationCommandOptionType.Number,
                    name: SLASH_COMMAND.commands.delay.delay,
                    description: "Delay in seconds",
                    required: false,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: SLASH_COMMAND.commands.athletes.name,
            description: "Get or set athletes",
            options: range(1, SLASH_COMMAND.commands.athletes.athletesCount + 1).flatMap((i) => [
                {
                    type: ApplicationCommandOptionType.String,
                    name: `${SLASH_COMMAND.commands.athletes.athletesPrefix}${i}`,
                    description: `Athlete ${i}`,
                    required: false,
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: `${SLASH_COMMAND.commands.athletes.timePrefix}${i}`,
                    description: `Time in seconds for athlete ${1}`,
                    required: false,
                },
            ]),
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: SLASH_COMMAND.commands.fresh.name,
            description: "Mark yourself or an athlete as fresh",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: SLASH_COMMAND.commands.fresh.athlete,
                    description: "Athlete to mark as fresh",
                    required: false,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: SLASH_COMMAND.commands.toast.name,
            description: "Mark yourself or an athlete as toasted",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: SLASH_COMMAND.commands.toast.athlete,
                    description: "Athlete to mark as toasted",
                    required: false,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: SLASH_COMMAND.commands.plus.name,
            description: "Add time to the current athlete",
            options: [
                {
                    type: ApplicationCommandOptionType.Number,
                    name: SLASH_COMMAND.commands.plus.time,
                    description: "Time in seconds to add to the current user",
                    required: true,
                },
            ],
        },
    ],
};
