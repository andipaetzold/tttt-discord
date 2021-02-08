import { Message, TextChannel } from "discord.js";
import { getConfig } from "../../config";
import { DEFAULT_PREFIX } from "../../constants";
import { log } from "../../services/log";
import { getInviteUrl, hasVoicePermissions } from "../../services/permissions";
import { addTimer } from "../../services/timer";
import { EMOJI_ERROR, EMOJI_SUCCESS } from "../../util/emojis";
import { getVoiceConnection } from "../../util/getVoiceConnection";

export async function start(message: Message): Promise<void> {
    const guildId = message.guild!.id;
    const hasPermissions = hasVoicePermissions(message.guild!);

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

    const config = await getConfig(guildId);
    const connection = await getVoiceConnection(config, message.member!.voice.channel ?? undefined);

    if (connection === undefined) {
        await message.channel.send(
            `I don't know which voice channel to join. Join a voice channel and run \`${DEFAULT_PREFIX}start\` again.`
        );
        return;
    }

    log("Start", `G:${guildId}`);
    await message.react(EMOJI_SUCCESS);

    await addTimer(guildId, message.channel as TextChannel);
}
