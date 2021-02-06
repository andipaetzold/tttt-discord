import { Message } from "discord.js";
import { client } from "../client";
import { PREFIX } from "../constants";
import { log } from "../log";
import { stopTimer } from "../timer";

export async function stop(message: Message, sendMessage: (message: string) => Promise<Message>): Promise<void> {
    const guildId = message.guild!.id;
    const connection = client.voice?.connections.find((c) => c.channel.guild.id === guildId);

    if (connection === undefined) {
        await sendMessage(`Looks like I am not in a voice channel on this server. Use \`${PREFIX}join\` to add me.`);
        return;
    }

    log("Stop", `VC:${connection.channel.id}`);
    await message.react("🏁");

    await stopTimer(guildId);
}
