import { ChatInputCommandInteraction } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import { LANGUAGES } from "../../languages";
import { LanguageKey } from "../../languages/types";
import { getConfig, setConfig } from "../../persistence/config";
import logger from "../../services/logger";

export async function language(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guild!.id;
    const config = await getConfig(guildId);

    const newLanguageKey = interaction.options.getString(
        SLASH_COMMAND.commands.language.language,
        false
    ) as LanguageKey | null;
    logger.info(guildId, `Options: ${SLASH_COMMAND.commands.language.language}=${newLanguageKey}`);

    if (!newLanguageKey) {
        const language = LANGUAGES.find((language) => language.key === config.languageKey)!;
        await interaction.reply(`Language: ${language.name}`);
        return;
    }

    await setConfig({ ...config, languageKey: newLanguageKey });

    const language = LANGUAGES.find((language) => language.key === newLanguageKey)!;
    await interaction.reply(`Language: ${language.name}`);
}
