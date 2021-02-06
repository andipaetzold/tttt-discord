import { Message } from "discord.js";
import { DEFAULT_PREFIX } from "../constants";
import { log } from "../log";
import { addTimer } from "../timer";
import { getVoiceConnection } from "../util/getVoiceConnection";
import { getInviteUrl, hasVoicePermissions } from "../permissions";

export async function start(message: Message, sendMessage: (message: string) => Promise<Message>): Promise<void> {
    const guildId = message.guild!.id;
    const hasPermissions = await hasVoicePermissions(guildId);

    if (!hasPermissions) {
        const invite = await getInviteUrl();
        await Promise.all([
            message.channel.send(
                `I don't have enough permissions to join the voice channel. Please use this link to grant more permissions: <${invite}>.`
            ),
            message.react("❌"),
        ]);
        return;
    }

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
