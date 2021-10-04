import { getVoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import { BOT_ID } from "../../constants";
import logger from "../../services/logger";
import { stopTimer } from "../../services/timer";
import { EMOJI_SUCCESS } from "../../util/emojis";
import * as Sentry from "@sentry/node";

export async function stop(message: Message, scope: Sentry.Scope): Promise<void> {
    await message.react(EMOJI_SUCCESS);

    const guildId = message.guild!.id;

    logger.info(guildId, "Stopping timer");
    await stopTimer(guildId, scope);

    const connection = getVoiceConnection(guildId, BOT_ID);
    if (connection !== undefined) {
        logger.info(guildId, `Disconnecting from VC:${connection.joinConfig.channelId}`);
        connection.disconnect();
    }
}
