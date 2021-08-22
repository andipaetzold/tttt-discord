import { createAudioPlayer, createAudioResource, VoiceConnection } from "@discordjs/voice";
import { getAudioUrl } from "google-tts-api";
import { LOG_SPEAK } from "./constants";
import { languages } from "./languages";
import { LanguageKey, Locale } from "./languages/types";
import logger from "./services/logger";
import { download } from "./util/download";

export async function speak(text: string, locale: Locale, connection: VoiceConnection): Promise<void> {
    if (LOG_SPEAK) {
        logger.info(connection.joinConfig.guildId, `Speak: "${text}"`);
    }

    await new Promise<void>(async (resolve, reject) => {
        const url = getAudioUrl(text, {
            lang: locale,
            slow: false,
            host: "https://translate.google.com",
        });

        const player = createAudioPlayer();
        const subscription = connection.subscribe(player);

        const filename = await download(url);
        const resource = createAudioResource(filename);

        player.play(resource);
        player.on("error", reject);

        const timeout = setTimeout(() => {
            player.stop();
            subscription?.unsubscribe();
            resolve();
        }, 5_000);

        resource.playStream.on("end", () => {
            clearTimeout(timeout);
            subscription?.unsubscribe();
            resolve();
        });
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
