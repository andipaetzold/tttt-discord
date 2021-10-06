import { ApplicationCommandData, ChatInputApplicationCommandData } from "discord.js";
import { BOT_ID, MAIN_BOT } from "../../constants";
import { client } from "../../discord";
import { LANGUAGES } from "../../languages";
import { getAllTimerKeys } from "../../persistence/timer";
import logger from "../../services/logger";
import { startTimerLoop } from "../../timerLoop";
import range from "lodash/range";

export async function handleReady() {
    startTimerLoop();

    logger.info(undefined, `Main Bot: ${MAIN_BOT}`);
    logger.info(undefined, `Bot Id: ${BOT_ID}`);

    const guilds = client.guilds.valueOf();
    logger.info(undefined, `Member of ${guilds.size} server(s)`);

    const timerKeys = await getAllTimerKeys();
    logger.info(undefined, `${timerKeys.length} running timer(s)`);

    logger.info(undefined, "Ready");

    const commands = client.application!.commands;

    await commands.create({
        name: MAIN_BOT ? "timer" : `timer${BOT_ID}`,
        ...command,
    });
}

const command: Omit<ChatInputApplicationCommandData, "name"> = {
    type: "CHAT_INPUT",
    description: "Timer",
    options: [
        {
            type: "SUB_COMMAND",
            name: "start",
            description: "Start the timer",
        },
        {
            type: "SUB_COMMAND",
            name: "stop",
            description: "Stop the timer",
        },
        {
            type: "SUB_COMMAND",
            name: "help",
            description: "Help",
        },
        {
            type: "SUB_COMMAND",
            name: "athlete",
            description: "Set the time of a specific athlete",
            options: [
                {
                    type: "MENTIONABLE",
                    name: "athlete",
                    description: "The athlete to set the time for",
                    required: true,
                },
                {
                    type: "INTEGER",
                    name: "time",
                    description: "The time to set the athlete to",
                    required: true,
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "language",
            description: "Get or set the language for the timer",
            options: [
                {
                    type: "STRING",
                    description: "The language to set",
                    name: "language",
                    choices: LANGUAGES.map(({ name, key }) => ({ name, value: key })),
                    required: false,
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "delay",
            description: "Get or set the start delay",
            options: [
                {
                    type: "NUMBER",
                    name: "delay",
                    description: "Delay in seconds",
                    required: false,
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "athletes",
            description: "Get or set athletes",
            options: range(1, 9).flatMap((i) => [
                {
                    type: "MENTIONABLE",
                    name: `athlete${i}`,
                    description: `Athlete ${i}`,
                    required: false,
                },
                {
                    type: "INTEGER",
                    name: `time${i}`,
                    description: `Time in seconds for athlete ${1}`,
                    required: false,
                },
            ]),
        },
    ],
};
