import { BOT_ID, MAIN_BOT } from "../../constants";
import { client } from "../../discord";
import { getAllTimerKeys } from "../../persistence/timer";
import logger from "../../services/logger";
import { startTimerLoop } from "../../timerLoop";
import { getSlashCommand } from "./slashCommand";

export async function handleReady() {
    startTimerLoop();

    logger.info(undefined, `Main Bot: ${MAIN_BOT}`);
    logger.info(undefined, `Bot Id: ${BOT_ID}`);

    const guilds = client.guilds.valueOf();
    logger.info(undefined, `Member of ${guilds.size} server(s)`);

    const timerKeys = await getAllTimerKeys();
    logger.info(undefined, `${timerKeys.length} running timer(s)`);

    logger.info(undefined, "Ready");

    await initCommands();
}

async function initCommands() {
    const applicationCommands = client.application!.commands;
    const command = getSlashCommand();

    const existingCommands = await applicationCommands.fetch();
    const existingCommand = existingCommands.find((cmd) => cmd.name === command.name);

    if (existingCommand) {
        logger.info(undefined, `Updating command '${command.name}'`);
        await applicationCommands.edit(existingCommand, command);
    } else {
        logger.info(undefined, `Creating command '${command.name}'`);
        await applicationCommands.create(command);
    }
}
