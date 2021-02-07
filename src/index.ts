import dotenv from "dotenv";
import { client } from "./discord";
import { handleMessage } from "./handleMessage";
import { reset } from "./handlers/reset";
import { log } from "./log";
import { startTimer } from "./timer";

dotenv.config();

client.once("ready", ready);
client.once("reconnecting", () => log("Reconnecting", "Server"));
client.once("disconnect", () => log("Disconnect", "Server"));
client.on("error", (e) => console.error("Error", e));
client.on("message", handleMessage);

client.on("guildDelete", (guild) => reset(guild.id));

client.login(process.env.DISCORD_TOKEN);

function ready() {
    client.user!.setActivity({
        name: "WTRL on Zwift",
        type: "WATCHING",
    });

    startTimer();

    log(`Member of ${client.guilds.cache.size} server(s)`, "Server");
    client.guilds.cache.forEach((guild) => {
        log(`${guild.id}: ${guild.name}`, "Server");
    });

    log("Ready", "Server");
}
