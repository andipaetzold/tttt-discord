import { createAudioPlayer, createAudioResource, VoiceConnection } from "@discordjs/voice";
import crypto from "crypto";
import fs from "fs";
import { getAudioUrl } from "google-tts-api";
import os from "os";
import path from "path";
import { LOG_SPEAK } from "./constants";
import { languages } from "./languages";
import { LanguageKey, Locale } from "./languages/types";
import { download } from "./services/download";
import logger from "./services/logger";

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

        const filename = await getFilePath(url);
        const resource = createAudioResource(filename);
        player.play(resource);

        player.on("error", reject);
        resource.playStream.on("end", () => {
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

export async function getFilePath(url: string): Promise<string> {
    const hash = crypto.createHash("md5").update(url).digest("hex");
    const filename = path.resolve(os.tmpdir(), hash);

    if (!fs.existsSync(filename)) {
        await download(url, filename);
    }
    return filename;
}
