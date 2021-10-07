import { CommandInteraction } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import { getConfig, setConfig } from "../../persistence/config";
import { isValidDelay } from "../messageCreate/util";

export async function delay(interaction: CommandInteraction) {
    const config = await getConfig(interaction.guild!.id);

    const newStartDelay = interaction.options.getNumber(SLASH_COMMAND.commands.delay.delay, false);
    if (newStartDelay === null) {
        await interaction.reply(`Start delay: ${config.startDelay}`);
        return;
    }

    if (!isValidDelay(newStartDelay)) {
        await interaction.reply({ content: "Invalid delay", ephemeral: true });
        return;
    }

    await setConfig({ ...config, startDelay: newStartDelay });
    await interaction.reply(`Start delay: ${newStartDelay}`);
}
