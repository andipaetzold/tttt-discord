import { getVoiceConnection } from "@discordjs/voice";
import { type Scope } from "@sentry/node";
import { ChatInputCommandInteraction } from "discord.js";
import { environment } from "../../environment";
import { timerRepo } from "../../persistence";
import logger from "../../services/logger";
import { stopTimer } from "../../services/timer";

export async function stop(interaction: ChatInputCommandInteraction, scope: Scope): Promise<void> {
    const guildId = interaction.guildId!;

    if (!(await timerRepo.exists(guildId))) {
        logger.info(guildId, "Timer is not running");
        await interaction.reply({
            content: "Timer is not running",
            flags: ["Ephemeral"],
        });
        return;
    }

    logger.info(guildId, "Stopping timer");
    await stopTimer(guildId, scope);

    const connection = getVoiceConnection(guildId, environment.botId);
    if (connection !== undefined) {
        logger.info(guildId, `Disconnecting from VC:${connection.joinConfig.channelId}`);
        connection.disconnect();
        connection.destroy();
    }

    await interaction.reply("Timer stopped");
}
