import { ChatInputCommandInteraction } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import { timerRepo } from "../../persistence/timer";
import { addTimeToCurrentAthlete } from "../../services/timer";
import { isValidDelay } from "../../util/isValidDelay";
import { updateStatusMessage } from "../../services/statusMessage";

export async function plus(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guild!.id;

    const options = {
        time: interaction.options.getNumber("time", true),
    };
    if (!isValidDelay(options.time)) {
        await interaction.reply(`"${options.time}" is not a valid time`);
        return;
    }

    if (!(await timerRepo.exists(guildId))) {
        await interaction.reply(`Start the timer first using \`/${SLASH_COMMAND.name} start\``);
        return;
    }

    await addTimeToCurrentAthlete(guildId, options.time);
    await Promise.all([interaction.reply(`Added ${options.time} seconds`), updateStatusMessage(guildId)]);
}
