import { BOT_ID, MAIN_BOT } from "../../constants";
import { client } from "../../discord";
import { getAllTimerKeys } from "../../persistence/timer";
import logger from "../../services/logger";
import { startTimerLoop } from "../../timerLoop";
import { initCommands } from "./slashCommand";

export async function handleReady() {
    startTimerLoop();

    logger.info(undefined, `Main Bot: ${MAIN_BOT}`);
    logger.info(undefined, `Bot Id: ${BOT_ID}`);

    const guilds = client.guilds.valueOf();
    logger.info(undefined, `Member of ${guilds.size} server(s)`);

    const timerKeys = await getAllTimerKeys();
    logger.info(undefined, `${timerKeys.length} running timer(s)`);

    await initCommands();
}
