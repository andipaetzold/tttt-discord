import { ChatInputCommandInteraction } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import { configRepo } from "../../persistence";
import logger from "../../services/logger";
import { isValidDelay } from "../../util/isValidDelay";

export async function delay(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guild!.id;
    const config = await configRepo.get(interaction.guild!.id);

    const newStartDelay = interaction.options.getNumber(SLASH_COMMAND.commands.delay.delay, false);
    logger.info(guildId, `Options: ${SLASH_COMMAND.commands.delay.delay}=${newStartDelay}`);

    if (newStartDelay === null) {
        await interaction.reply(`Start delay: ${config.startDelay}`);
        return;
    }

    if (!isValidDelay(newStartDelay)) {
        await interaction.reply({
            content: "Invalid delay",
            flags: ["Ephemeral"],
        });
        return;
    }

    await configRepo.set({ ...config, startDelay: newStartDelay });
    await interaction.reply(`Start delay: ${newStartDelay}s`);
}
