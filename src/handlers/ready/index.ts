import { client } from "../../discord";
import { getAllTimerKeys } from "../../persistence/timer";
import logger from "../../services/logger";
import { fetchStatusMessages } from "../../services/statusMessage";
import { startTimerLoop } from "../../timerLoop";

export async function handleReady() {
    client.user!.setActivity({
        name: "WTRL on Zwift",
        type: "WATCHING",
    });
    client.user!.setStatus("online");

    startTimerLoop();

    logger.info(undefined, `Member of ${client.guilds.cache.size} server(s)`);
    client.guilds.cache.forEach((guild) => {
        logger.info(undefined, `${guild.id}: ${guild.name}`);
    });

    await fetchStatusMessages();

    const timerKeys = await getAllTimerKeys();
    logger.info(undefined, `${timerKeys.length} running timer(s)`);

    logger.info(undefined, "Ready");
}
