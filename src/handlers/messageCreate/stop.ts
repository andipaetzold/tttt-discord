import { getVoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import logger from "../../services/logger";
import { stopTimer } from "../../services/timer";
import { EMOJI_SUCCESS } from "../../util/emojis";

export async function stop(message: Message): Promise<void> {
    await message.react(EMOJI_SUCCESS);

    const guildId = message.guild!.id;

    logger.info(guildId, "Stopping timer");
    await stopTimer(guildId);

    const connection = getVoiceConnection(guildId);
    if (connection !== undefined) {
        logger.info(guildId, `Disconnecting from VC:${connection.joinConfig.channelId}`);
        connection.disconnect();
    }
}
