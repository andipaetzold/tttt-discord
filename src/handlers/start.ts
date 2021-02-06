import { Message, VoiceChannel, VoiceConnection } from "discord.js";
import { client } from "../client";
import { getConfig, saveConfig } from "../config";
import { DEFAULT_PREFIX } from "../constants";
import { log } from "../log";
import { addTimer } from "../timer";
import { getVoiceConnection } from "../util/getVoiceConnection";

export async function start(message: Message, sendMessage: (message: string) => Promise<Message>): Promise<void> {
    const guildId = message.guild!.id;
    const connection = await getVoiceConnection(guildId, message.member!.voice.channel ?? undefined);

    if (connection === undefined) {
        await sendMessage(
            `I don't know which voice channel to join. Join a voice channel and run \`${DEFAULT_PREFIX}start\` again.`
        );
        return;
    }

    log("Start", `G:${guildId}`);
    await message.react("🏁");

    await addTimer(guildId);
}
