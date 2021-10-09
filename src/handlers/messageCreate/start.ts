import * as Sentry from "@sentry/node";
import { Message, TextChannel } from "discord.js";
import { DEFAULT_PREFIX } from "../../constants";
import { getConfig } from "../../persistence/config";
import { getInviteUrl, hasVoicePermissions } from "../../services/permissions";
import { addTimer } from "../../services/timer";
import { EMOJI_ERROR, EMOJI_SUCCESS } from "../../util/emojis";
import { getVoiceConnection } from "../../util/getVoiceConnection";

export async function start(message: Message, scope: Sentry.Scope): Promise<void> {
    const guildId = message.guild!.id;
    const hasPermissions = hasVoicePermissions(message.guild!);

    if (!hasPermissions) {
        const invite = getInviteUrl();
        await Promise.all([
            message.channel.send(
                `I don't have enough permissions to join the voice channel. Please use this link to grant more permissions: <${invite}>.`
            ),
            message.react(EMOJI_ERROR),
        ]);
        return;
    }

    const config = await getConfig(guildId);
    const connection = await getVoiceConnection(config, message.member!);

    if (connection === undefined) {
        await message.channel.send(
            `I don't know which voice channel to join. Join a voice channel and run \`${DEFAULT_PREFIX} start\` again.`
        );
        return;
    }

    await message.react(EMOJI_SUCCESS);

    await addTimer(guildId, message.channel as TextChannel, scope);
}
