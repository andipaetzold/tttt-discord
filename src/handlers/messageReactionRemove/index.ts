import { MessageReaction, PartialUser, User } from "discord.js";
import { client } from "../../discord";
import { getConfig } from "../../persistence/config";
import { getTimer } from "../../persistence/timer";
import logger from "../../services/logger";
import { HandlerProps } from "../../services/sentry";
import { updateStatusMessage } from "../../services/statusMessage";
import { setAthleteAsFresh } from "../../services/timer";
import { EMOJI_TOAST } from "../../util/emojis";

export async function handleMessageReactionRemove({
    args: [messageReaction, user],
    scope,
}: HandlerProps<[MessageReaction, User | PartialUser]>) {
    if (messageReaction.partial) {
        try {
            await messageReaction.fetch();
        } catch {
            return;
        }
    }

    if (user.id === client.user!.id) {
        return;
    }

    if (!messageReaction.message.guild) {
        return;
    }

    const guildId = messageReaction.message.guild!.id;

    const timer = await getTimer(guildId);
    if (!timer) {
        return;
    }

    if (
        timer.status?.channelId !== messageReaction.message.channel.id ||
        timer.status?.messageId !== messageReaction.message.id
    ) {
        return;
    }

    logger.info(messageReaction.message.guild!.id, `Message Reaction Remove: ${messageReaction.emoji.name}`);

    switch (messageReaction.emoji.name) {
        case EMOJI_TOAST: {
            const config = await getConfig(guildId);
            const athlete = config.athletes.find((a) => a.userId === user.id);

            if (!athlete) {
                return;
            }

            await setAthleteAsFresh(guildId, athlete);
            await updateStatusMessage(guildId, scope);
            break;
        }
    }
}
