import { Message } from "discord.js";
import { client } from "../client";
import { log } from "../log";
import { stopTimer } from "../timer";

export async function stop(message: Message, sendMessage: (message: string) => Promise<Message>): Promise<void> {
    const guildId = message.guild!.id;
    const connection = client.voice?.connections.find((c) => c.channel.guild.id === guildId);

    if (connection === undefined) {
        return;
    }

    log("Stop", `G:${connection.channel.guild.id}`);
    await message.react("🏁");

    await stopTimer(guildId);


    log("Disconnect", `VC:${connection.channel.id}`);
    connection.disconnect();
}
