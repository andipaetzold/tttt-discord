import { MessageReaction, PartialUser, User } from "discord.js";
import { getConfig } from "../../config";
import { hasManageMessagesPermissions } from "../../services/permissions";
import { updateStatusMessage } from "../../services/statusMessage";
import { addTimeToCurrentAthlete, getTimer, setAthleteAsToast, skipCurrentAthlete } from "../../services/timer";
import { EMOJI_PLUS10, EMOJI_SKIP, EMOJI_TOAST } from "../../util/emojis";

export async function handleMessageReactionAdd(messageReaction: MessageReaction, user: User | PartialUser) {
    if (messageReaction.me) {
        return;
    }

    const guildId = messageReaction.message.guild!.id;

    const timer = await getTimer(guildId);
    if (!timer) {
        return;
    }

    if (
        timer.status?.channelId !== messageReaction.message.channel.id ||
        timer.status.messageId !== messageReaction.message.id
    ) {
        return;
    }

    switch (messageReaction.emoji.name) {
        case EMOJI_SKIP: {
            await skipCurrentAthlete(guildId);
            await updateStatusMessage(guildId);
            await removeReaction(messageReaction, user);
            break;
        }

        case EMOJI_PLUS10: {
            await addTimeToCurrentAthlete(guildId, 10);
            await updateStatusMessage(guildId);
            await removeReaction(messageReaction, user);
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
    if (await hasManageMessagesPermissions(messageReaction.message.guild!.id)) {
        await messageReaction.users.remove(user.id);
    }
}
