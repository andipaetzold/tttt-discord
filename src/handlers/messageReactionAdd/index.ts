import { MessageReaction, PartialUser, User } from "discord.js";
import { client } from "../../discord";
import { configRepo } from "../../persistence/config";
import { timerRepo } from "../../persistence/timer";
import logger from "../../services/logger";
import { hasManageMessagesPermissions } from "../../services/permissions";
import { HandlerProps } from "../../services/sentry";
import { updateStatusMessage } from "../../services/statusMessage";
import { addTimeToCurrentAthlete, setAthleteAsToast, skipCurrentAthlete } from "../../services/timer";
import { EMOJI_PLUS10, EMOJI_SKIP, EMOJI_TOAST } from "../../util/emojis";

export async function handleMessageReactionAdd({
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

    const timer = await timerRepo.get(guildId);
    if (!timer) {
        return;
    }

    if (
        timer.status?.channelId !== messageReaction.message.channel.id ||
        timer.status?.messageId !== messageReaction.message.id
    ) {
        return;
    }

    logger.info(messageReaction.message.guild!.id, `Message Reaction Add: ${messageReaction.emoji.name}`);

    switch (messageReaction.emoji.name) {
        case EMOJI_SKIP: {
            const removePromise = removeReaction(messageReaction, user);
            await skipCurrentAthlete(guildId);
            await updateStatusMessage(guildId, scope);
            await removePromise;
            break;
        }

        case EMOJI_PLUS10: {
            const removePromise = removeReaction(messageReaction, user);
            await addTimeToCurrentAthlete(guildId, 10);
            await updateStatusMessage(guildId, scope);
            await removePromise;
            break;
        }

        case EMOJI_TOAST: {
            const config = await configRepo.get(guildId);
            const athlete = config.athletes.find((a) => a.userId === user.id);

            if (!athlete) {
                await removeReaction(messageReaction, user);
                return;
            }

            await setAthleteAsToast(guildId, athlete);
            await updateStatusMessage(guildId, scope);
            break;
        }

        default: {
            await removeReaction(messageReaction, user);
            break;
        }
    }
}

async function removeReaction(messageReaction: MessageReaction, user: User | PartialUser) {
    if (hasManageMessagesPermissions(messageReaction.message.guild!)) {
        try {
            await messageReaction.users.remove(user.id);
        } catch {
            logger.warn(messageReaction.message.guild!.id, `Failed to remove reaction`);
        }
    }
}
