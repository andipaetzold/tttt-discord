import { CommandInteraction } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import { LANGUAGES } from "../../languages";
import { LanguageKey } from "../../languages/types";
import { getConfig, setConfig } from "../../persistence/config";

export async function language(interaction: CommandInteraction) {
    const config = await getConfig(interaction.guild!.id);

    const newLanguageKey = interaction.options.getString(
        SLASH_COMMAND.commands.language.language,
        false
    ) as LanguageKey | null;
    if (!newLanguageKey) {
        const language = LANGUAGES.find((language) => language.key === config.languageKey)!;
        await interaction.reply(`Language: ${language.name}`);
        return;
    }

    await setConfig({ ...config, languageKey: newLanguageKey });

    const language = LANGUAGES.find((language) => language.key === newLanguageKey)!;
    await interaction.reply(`Language: ${language.name}`);
}
