import { Message } from "discord.js";
import { client } from "../../discord";
import logger from "../../services/logger";
import { stopTimer } from "../../services/timer";
import { EMOJI_SUCCESS } from "../../util/emojis";

export async function stop(message: Message): Promise<void> {
    await message.react(EMOJI_SUCCESS);

    const guildId = message.guild!.id;
    const connection = client.voice?.connections.find((c) => c.channel.guild.id === guildId);

    if (connection === undefined) {
        return;
    }

    logger.info(connection.channel.guild.id, "Stopping timer");
    await stopTimer(guildId);

    logger.info(connection.channel.guild.id, `Disconnecting from VC:${connection.channel.id}`);
    connection.disconnect();
}
