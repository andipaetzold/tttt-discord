import { createAudioPlayer, createAudioResource, StreamType, VoiceConnection } from "@discordjs/voice";
import { createReadStream } from "node:fs";
import { getAudioUrl } from "google-tts-api";
import { environment } from "./environment";
import { LANGUAGES } from "./languages";
import { LanguageKey, Locale } from "./languages/types";
import logger from "./services/logger";
import { opusAudioCache } from "./util/opusAudioCache";

export async function speak(text: string, locale: Locale, connection: VoiceConnection): Promise<void> {
    if (environment.logging.speak) {
        logger.info(connection.joinConfig.guildId, `Speak: "${text}"`);
    }

    const url = getAudioUrl(text, {
        lang: locale,
        slow: false,
        host: "https://translate.google.com",
    });
    const filename = await opusAudioCache.get(url);

    await new Promise<void>((resolve, reject) => {
        const player = createAudioPlayer();
        const subscription = connection.subscribe(player);

        const resource = createAudioResource(createReadStream(filename), { inputType: StreamType.OggOpus });

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
    const { locale, voiceCommands } = LANGUAGES.find((language) => language.key === languageKey)!;

    if (!voiceCommands[command]) {
        return;
    }
    const text = voiceCommands[command](args);
    await speak(text, locale, connection);
}
