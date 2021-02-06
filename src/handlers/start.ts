import { Message } from "discord.js";
import { DEFAULT_PREFIX } from "../constants";
import { log } from "../log";
import { getInviteUrl, hasVoicePermissions } from "../permissions";
import { addTimer } from "../timer";
import { EMOJI_ERROR, EMOJI_SUCCESS } from "../util/emojis";
import { getVoiceConnection } from "../util/getVoiceConnection";

export async function start(message: Message): Promise<void> {
    const guildId = message.guild!.id;
    const hasPermissions = await hasVoicePermissions(guildId);

    if (!hasPermissions) {
        const invite = await getInviteUrl();
        await Promise.all([
            message.channel.send(
                `I don't have enough permissions to join the voice channel. Please use this link to grant more permissions: <${invite}>.`
            ),
            message.react(EMOJI_ERROR),
        ]);
        return;
    }

    const connection = await getVoiceConnection(guildId, message.member!.voice.channel ?? undefined);

    if (connection === undefined) {
        await message.channel.send(
            `I don't know which voice channel to join. Join a voice channel and run \`${DEFAULT_PREFIX}start\` again.`
        );
        return;
    }

    log("Start", `G:${guildId}`);
    await message.react(EMOJI_SUCCESS);

    await addTimer(guildId);
}
