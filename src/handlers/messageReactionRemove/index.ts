import { MessageReaction, PartialUser, User } from "discord.js";
import { getConfig } from "../../persistence/config";
import { getTimer } from "../../persistence/timer";
import logger from "../../services/logger";
import { updateStatusMessage } from "../../services/statusMessage";
import { setAthleteAsFresh } from "../../services/timer";
import { EMOJI_TOAST } from "../../util/emojis";

export async function handleMessageReactionRemove(messageReaction: MessageReaction, user: User | PartialUser) {
    if (messageReaction.me) {
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
            const athleteIndex = config.athletes.findIndex((a) => a.userId === user.id);

            if (athleteIndex === -1) {
                return;
            }

            await setAthleteAsFresh(guildId, athleteIndex);
            await updateStatusMessage(guildId);
            break;
        }
    }
}
