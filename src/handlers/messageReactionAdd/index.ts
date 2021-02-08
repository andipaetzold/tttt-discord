import { MessageReaction, PartialUser, User } from "discord.js";
import { hasManageMessagesPermissions } from "../../services/permissions";
import { updateStatusMessage } from "../../services/statusMessage";
import { addTimeToCurrentAthlete, getTimer, skipCurrentAthlete } from "../../services/timer";
import { EMOJI_PLUS10, EMOJI_SKIP } from "../../util/emojis";

export async function handleMessageReactionAdd(messageReaction: MessageReaction, user: User | PartialUser) {
    if (messageReaction.me) {
        return;
    }

    if (![EMOJI_SKIP, EMOJI_PLUS10].includes(messageReaction.emoji.name)) {
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

    removeReaction(messageReaction, user);

    switch (messageReaction.emoji.name) {
        case EMOJI_SKIP: {
            await skipCurrentAthlete(guildId);
            await updateStatusMessage(guildId);
            if (await hasManageMessagesPermissions(guildId)) {
                await messageReaction.users.remove(user.id);
            }

            break;
        }

        case EMOJI_PLUS10: {
            await addTimeToCurrentAthlete(guildId, 10);
            await updateStatusMessage(guildId);
            if (await hasManageMessagesPermissions(guildId)) {
                await messageReaction.users.remove(user.id);
            }

            break;
        }
    }
}

async function removeReaction(messageReaction: MessageReaction, user: User | PartialUser) {
    if (await hasManageMessagesPermissions(messageReaction.message.guild!.id)) {
        await messageReaction.users.remove(user.id);
    }
}
