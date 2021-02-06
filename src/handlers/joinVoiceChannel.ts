import type { Message, VoiceChannel } from "discord.js";
import { log } from "../log";
import { speak } from "../speak";

export async function joinVoiceChannel(voiceChannel: VoiceChannel | null, sendMessage: (message: string) => Promise<Message>) {
    if (voiceChannel === null) {
        await sendMessage("You must be in a voice channel. I don't know where to join.");
        return;
    }

    log("Joining", `VC:${voiceChannel.id}`);
    await sendMessage(`Joining <#${voiceChannel.id}>...`);
    
    const connection = await voiceChannel.join();
    speak("Timer is ready", connection)
}
