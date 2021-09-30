import { Message } from "discord.js";
import { LANGUAGES } from "../../languages";
import { LanguageKey } from "../../languages/types";
import { getConfig, setConfig } from "../../persistence/config";
import { parseMessage } from "../../util/message";
import { confirmMessage, sendError } from "./util";

export async function language(message: Message) {
    const { args } = parseMessage(message)!;

    await handleLanguageCommand(args, message)
}

/**
 * @param message Content should not be parsed. Used to respond to command.
 */
export async function handleLanguageCommand(args: string[], message: Message) {
    const config = await getConfig(message.guild!.id);

    if (args.length === 0) {
        const language = LANGUAGES.find((language) => language.key === config.languageKey)!;
        await message.channel.send(`Language: ${language.name}`);
        return;
    }

    const newLanguageKey = args[0].toLowerCase();
    const newLanguage = LANGUAGES.find((language) => language.key === newLanguageKey);
    if (!newLanguage) {
        await sendError(
            `Unknown language. The following languages are available:\n${LANGUAGES
                .map((language) => `• \`${language.key}\` (${language.name})`)
                .join("\n")}`,
            message
        );
        return;
    }

    await setConfig({
        ...config,
        languageKey: newLanguageKey as LanguageKey,
    });

    await confirmMessage(message);
}