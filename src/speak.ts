import type { VoiceConnection } from "discord.js";
import { getAudioUrl } from "google-tts-api";
import { LOG_SPEAK } from "./constants";
import { languages } from "./languages";
import { LanguageKey, Locale } from "./languages/types";
import logger from "./services/logger";

export async function speak(text: string, locale: Locale, connection: VoiceConnection): Promise<void> {
    if (LOG_SPEAK) {
        logger.info(connection.channel.guild.id, `Speak: "${text}"`);
    }

    await new Promise((resolve, reject) => {
        const url = getAudioUrl(text, {
            lang: locale,
            slow: false,
            host: "https://translate.google.com",
        });

        const dispatcher = connection.play(url);

        dispatcher.on("finish", resolve);
        dispatcher.on("error", reject);
    });
}

export async function speakCommand(
    command: string,
    args: Record<string, unknown>,
    connection: VoiceConnection,
    languageKey: LanguageKey
): Promise<void> {
    const { locale, voiceCommands } = languages.find((language) => language.key === languageKey)!;

    if (!voiceCommands[command]) {
        return;
    }
    const text = voiceCommands[command](args);
    await speak(text, locale, connection);
}
