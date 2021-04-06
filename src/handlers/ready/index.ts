import { client } from "../../discord";
import { getAllTimerKeys } from "../../persistence/timer";
import logger from "../../services/logger";
import { fetchStatusMessages } from "../../services/statusMessage";
import { startTimerLoop } from "../../timerLoop";

export async function handleReady() {
    startTimerLoop();

    const guilds = client.guilds.valueOf();
    logger.info(undefined, `Member of ${guilds.size} server(s)`);
    guilds.forEach((guild) => {
        logger.info(undefined, `${guild.id}: ${guild.name}`);
    });

    await fetchStatusMessages();

    const timerKeys = await getAllTimerKeys();
    logger.info(undefined, `${timerKeys.length} running timer(s)`);

    logger.info(undefined, "Ready");
}
