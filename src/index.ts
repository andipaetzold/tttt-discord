import { TextChannel } from "discord.js";
import dotenv from "dotenv";
import { removeConfig } from "./config";
import { client } from "./discord";
import { handleMessage } from "./handleMessage";
import { handleMessageReactionAdd } from "./handleMessageReactionAdd";
import { log } from "./log";
import { createTimerKey, keys, readMany } from "./redis";
import { startTimer, stopTimer } from "./timer";
import { Timer } from "./types";

dotenv.config();

client.once("ready", ready);
client.once("reconnecting", () => log("Reconnecting", "Server"));
client.once("disconnect", () => log("Disconnect", "Server"));
client.on("error", (e) => console.error("Error", e));
client.on("message", handleMessage);
client.on("messageReactionAdd", handleMessageReactionAdd);

client.on("guildCreate", (guild) => {
    log(`Joined ${guild.id}: ${guild.name}`, "Server");
});
client.on("guildDelete", async (guild) => {
    await Promise.all([stopTimer(guild.id), removeConfig(guild.id)]);
});

client.login(process.env.DISCORD_TOKEN);

async function ready() {
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

    fetchStatusMessages();

    log("Ready", "Server");
}

/**
 * Required to receive the `messageReactionAdd` event
 */
async function fetchStatusMessages() {
    const timerKeys = await keys(createTimerKey("*"));
    const timers = await readMany<Timer>(timerKeys);

    log(`${timers.length} running timer(s)`, "Server");

    for (const timer of timers) {
        if (timer?.status) {
            const channel = (await client.channels.fetch(timer.status.channelId)) as TextChannel;
            channel.messages.fetch(timer.status.messageId);
        }
    }
}
