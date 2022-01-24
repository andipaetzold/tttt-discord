import { getVoiceConnection } from "@discordjs/voice";
import * as Sentry from "@sentry/node";
import { CommandInteraction } from "discord.js";
import { BOT_ID } from "../../constants";
import { timerExists } from "../../persistence/timer";
import logger from "../../services/logger";
import { stopTimer } from "../../services/timer";

export async function stop(interaction: CommandInteraction, scope: Sentry.Scope): Promise<void> {
    const guildId = interaction.guildId!;

    if (!(await timerExists(guildId))) {
        logger.info(guildId, "Timer is not running");
        await interaction.reply({ content: "Timer is not running", ephemeral: true });
        return;
    }

    logger.info(guildId, "Stopping timer");
    await stopTimer(guildId, scope);

    const connection = getVoiceConnection(guildId, BOT_ID);
    if (connection !== undefined) {
        logger.info(guildId, `Disconnecting from VC:${connection.joinConfig.channelId}`);
        connection.disconnect();
        connection.destroy();
    }

    await interaction.reply("Timer stopped");
}
