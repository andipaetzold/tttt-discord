import { Message } from "discord.js";
import { client } from "../../discord";
import { log } from "../../services/log";
import { stopTimer } from "../../timerLoop";
import { EMOJI_SUCCESS } from "../../util/emojis";

export async function stop(message: Message): Promise<void> {
    await message.react(EMOJI_SUCCESS);

    const guildId = message.guild!.id;
    const connection = client.voice?.connections.find((c) => c.channel.guild.id === guildId);

    if (connection === undefined) {
        return;
    }

    log("Stop", `G:${connection.channel.guild.id}`);

    await stopTimer(guildId);

    log("Disconnect", `VC:${connection.channel.id}`);
    connection.disconnect();
}
