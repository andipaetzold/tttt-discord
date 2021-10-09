import type { CommandInteraction } from "discord.js";
import { timerExists } from "../../persistence/timer";
import { updateStatusMessage } from "../../services/statusMessage";
import { skipCurrentAthlete } from "../../services/timer";

export async function skip(interaction: CommandInteraction): Promise<void> {
    const guildId = interaction.guild!.id;

    if (!(await timerExists(guildId))) {
        await interaction.reply(`Start the timer first using \`/timer start\``);
        return;
    }

    await skipCurrentAthlete(guildId);

    await Promise.all([interaction.reply("Athlete skipped"), updateStatusMessage(guildId)]);
}
