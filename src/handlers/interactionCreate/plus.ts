import { CommandInteraction } from "discord.js";
import { timerExists } from "../../persistence/timer";
import { addTimeToCurrentAthlete } from "../../services/timer";
import { isValidDelay } from "../../util/isValidDelay";

export async function plus(interaction: CommandInteraction): Promise<void> {
    const guildId = interaction.guild!.id;

    const options = {
        time: interaction.options.getInteger("time", true),
    };
    if (!isValidDelay(options.time)) {
        await interaction.reply(`"${options.time}" is not a valid time`);
        return;
    }

    if (!(await timerExists(guildId))) {
        await interaction.reply(`Start the timer first using \`/timer start\``);
        return;
    }

    await addTimeToCurrentAthlete(guildId, options.time);
    await interaction.reply(`Added ${options.time} seconds`);
}
