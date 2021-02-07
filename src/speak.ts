import type { VoiceConnection } from "discord.js";
import { getAudioUrl } from "google-tts-api";
import { log } from "./log";

export async function speak(text: string, connection: VoiceConnection): Promise<void> {
    log(`Speak: "${text}"`, `VC:${connection.channel.id}`);
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
    args: Record<string, unknown>,
    connection: VoiceConnection
): Promise<void> {
    if (!voiceCommands[command]) {
        return;
    }
    const text = voiceCommands[command](args);
    await speak(text, connection);
}

const voiceCommands: Record<string, (args: Record<string, unknown>) => string> = {
    15: ({ nextAthlete }) => `${nextAthlete}. Get ready.`,
    10: ({ started }) => (started ? "Change in 10" : "Start in 10"),
    5: () => "Five",
    2: () => "Two",
    1: () => "One",
    0: ({ nextAthlete, started }) => (started ? `Change to ${nextAthlete}` : "Let's go"),
    skip: ({ nextAthlete }) => `Go ${nextAthlete}!`,
};
