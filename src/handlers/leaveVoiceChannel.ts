import { Message } from "discord.js";
import { client } from "../client";
import { PREFIX } from "../constants";
import { log } from "../log";

export async function leaveVoiceChannel(guildId: string, sendMessage: (message: string) => Promise<Message>) {
    const connection = client.voice?.connections.find((c) => c.channel.guild.id === guildId);

    if (connection === undefined) {
        await sendMessage(`Looks like I am not in a voice channel on this server. Use \`${PREFIX}join\` to add me.`);
        return;
    }

    log("Leaving", `VC:${connection.channel.id}`);
    connection.disconnect();
}
