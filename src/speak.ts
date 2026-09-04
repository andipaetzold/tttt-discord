import { AudioPlayerStatus, createAudioPlayer, createAudioResource, VoiceConnection } from "@discordjs/voice";
import { getAudioUrl } from "google-tts-api";
import { environment } from "./environment";
import { LANGUAGES } from "./languages";
import { LanguageKey, Locale } from "./languages/types";
import logger from "./services/logger";
import { download } from "./util/download";

export async function speak(text: string, locale: Locale, connection: VoiceConnection): Promise<void> {
    if (environment.logging.speak) {
        logger.info(connection.joinConfig.guildId, `Speak: "${text}"`);
    }

    const url = getAudioUrl(text, {
        lang: locale,
        slow: false,
        host: "https://translate.google.com",
    });
    const filename = await download(url);
    const player = createAudioPlayer();
    const subscription = connection.subscribe(player);
    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
        await new Promise<void>((resolve, reject) => {
            // Wait for the player to drain trailing silence before unsubscribing.
            player.once(AudioPlayerStatus.Idle, resolve);
            player.once("error", reject);
            timeout = setTimeout(() => player.stop(true), 5_000);
            player.play(createAudioResource(filename));
        });
    } finally {
        clearTimeout(timeout);
        player.stop(true);
        subscription?.unsubscribe();
    }
}

export async function speakCommand(
    command: string,
    args: Record<string, unknown>,
    connection: VoiceConnection,
    languageKey: LanguageKey
): Promise<void> {
    const { locale, voiceCommands } = LANGUAGES.find((language) => language.key === languageKey)!;

    if (!voiceCommands[command]) {
        return;
    }
    const text = voiceCommands[command](args);
    await speak(text, locale, connection);
}
