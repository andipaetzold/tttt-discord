import { client } from "../../discord";
import { log } from "../../services/log";
import { createTimerKey, keys } from "../../services/redis";
import { fetchStatusMessages } from "../../services/statusMessage";
import { startTimerLoop } from "../../timerLoop";

export async function handleReady() {
    client.user!.setActivity({
        name: "WTRL on Zwift",
        type: "WATCHING",
    });
    client.user!.setStatus("online");

    startTimerLoop();

    log(`Member of ${client.guilds.cache.size} server(s)`, "Server");
    client.guilds.cache.forEach((guild) => {
        log(`${guild.id}: ${guild.name}`, "Server");
    });

    await fetchStatusMessages();

    const timerKeys = await keys(createTimerKey("*"));
    log(`${timerKeys.length} running timer(s)`, "Server");

    log("Ready", "Server");
}
