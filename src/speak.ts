import type { VoiceConnection } from "discord.js";
import { getAudioUrl } from "google-tts-api";

export async function speak(text: string, connection: VoiceConnection): Promise<void> {
    await new Promise((resolve, reject) => {
        const url = getAudioUrl(text, {
            lang: "en-US",
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
    args: Record<string, string>,
    connection: VoiceConnection
): Promise<void> {
    if (!voiceCommands[command]) {
        return;
    }
    const text = voiceCommands[command](args);
    await speak(text, connection);
}

const voiceCommands: Record<string, (args: Record<string, string>) => string> = {
    voiceChanged: () => "Go faster!",
    start: () => "Start",
    15: ({ nextAthlete }) => `${nextAthlete}. Get ready.`,
    10: () => "Change in 10",
    5: () => "Five",
    2: () => "Two",
    1: () => "One",
    0: ({ nextAthlete }) => `Change to ${nextAthlete}`,
};
