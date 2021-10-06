import { getVoiceConnection } from "@discordjs/voice";
import * as Sentry from "@sentry/node";
import { CommandInteraction } from "discord.js";
import { BOT_ID } from "../../constants";
import logger from "../../services/logger";
import { stopTimer } from "../../services/timer";

export async function stop(interaction: CommandInteraction, scope: Sentry.Scope): Promise<void> {
    const guildId = interaction.guildId!;

    logger.info(guildId, "Stopping timer");
    await stopTimer(guildId, scope);

    const connection = getVoiceConnection(guildId, BOT_ID);
    if (connection !== undefined) {
        logger.info(guildId, `Disconnecting from VC:${connection.joinConfig.channelId}`);
        connection.disconnect();
    }

    await interaction.reply("Timer stopped");
}
