import dotenv from "dotenv";
import { removeConfig } from "./config";
import { client } from "./discord";
import { handleMessage } from "./handleMessage";
import { log } from "./log";
import { startTimer, stopTimer } from "./timer";

dotenv.config();

client.once("ready", ready);
client.once("reconnecting", () => log("Reconnecting", "Server"));
client.once("disconnect", () => log("Disconnect", "Server"));
client.on("error", (e) => console.error("Error", e));
client.on("message", handleMessage);

client.on("guildCreate", (guild) => {
    log(`Joined ${guild.id}: ${guild.name}`, "Server");
});
client.on("guildDelete", async (guild) => {
    await Promise.all([stopTimer(guild.id), removeConfig(guild.id)]);
});

client.login(process.env.DISCORD_TOKEN);

function ready() {
    client.user!.setActivity({
        name: "WTRL on Zwift",
        type: "WATCHING",
    });
    client.user!.setStatus("online");

    startTimer();

    log(`Member of ${client.guilds.cache.size} server(s)`, "Server");
    client.guilds.cache.forEach((guild) => {
        log(`${guild.id}: ${guild.name}`, "Server");
    });

    log("Ready", "Server");
}
