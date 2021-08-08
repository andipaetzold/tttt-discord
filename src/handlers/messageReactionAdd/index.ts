import { Message, MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { client } from "../../discord";
import { getConfig } from "../../persistence/config";
import { getTimer } from "../../persistence/timer";
import logger from "../../services/logger";
import { hasManageMessagesPermissions } from "../../services/permissions";
import { updateStatusMessage } from "../../services/statusMessage";
import { addTimeToCurrentAthlete, setAthleteAsToast, skipCurrentAthlete } from "../../services/timer";
import { EMOJI_PLUS10, EMOJI_SKIP, EMOJI_TOAST } from "../../util/emojis";

export async function handleMessageReactionAdd(messageReaction: MessageReaction, user: User | PartialUser) {
    if (messageReaction.partial) {
        await messageReaction.fetch();
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

    logger.info(messageReaction.message.guild!.id, `Message Reaction Add: ${messageReaction.emoji.name}`);

    switch (messageReaction.emoji.name) {
        case EMOJI_SKIP: {
            const removePromise = removeReaction(messageReaction, user);
            await skipCurrentAthlete(guildId);
            await updateStatusMessage(guildId);
            await removePromise;
            break;
        }

        case EMOJI_PLUS10: {
            const removePromise = removeReaction(messageReaction, user);
            await addTimeToCurrentAthlete(guildId, 10);
            await updateStatusMessage(guildId);
            await removePromise;
            break;
        }

        case EMOJI_TOAST: {
            const config = await getConfig(guildId);
            const athleteIndex = config.athletes.findIndex((a) => a.userId === user.id);

            if (athleteIndex === -1) {
                await removeReaction(messageReaction, user);
                return;
            }

            await setAthleteAsToast(guildId, athleteIndex);
            await updateStatusMessage(guildId);
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
        await messageReaction.users.remove(user.id);
    }
}
