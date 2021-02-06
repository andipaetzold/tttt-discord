import dotenv from "dotenv";
import { client } from "./client";
import { handleMessage } from "./handleMessage";
import { log } from "./log";

dotenv.config();

client.once("ready", () => {
    client.user?.setActivity({
        name: "Zwift",
        type: "WATCHING",
    });
    log("Ready", "Server");
});
client.once("reconnecting", () => log("Reconnecting", "Server"));
client.once("disconnect", () => log("Disconnect", "Server"));
client.on("error", (e) => console.error("Error", e));
client.on("message", handleMessage);

client.login(process.env.DISCORD_TOKEN);
