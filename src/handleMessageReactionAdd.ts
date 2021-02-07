import { MessageReaction, PartialUser, User } from "discord.js";
import { getConfig } from "./config";
import { hasManageMessagesPermissions } from "./permissions";
import { createTimerKey, keys, readMany } from "./redis";
import { speakCommand } from "./speak";
import { updateTimer } from "./timer";
import { Timer } from "./types";
import { EMOJI_PLUS10, EMOJI_SKIP } from "./util/emojis";
import { getVoiceConnection } from "./util/getVoiceConnection";
import { getTime } from "./util/time";

export async function handleMessageReactionAdd(messageReaction: MessageReaction, user: User | PartialUser) {
    if (messageReaction.me) {
        return;
    }

    if (![EMOJI_SKIP, EMOJI_PLUS10].includes(messageReaction.emoji.name)) {
        return;
    }

    const timerKeys = await keys(createTimerKey("*"));
    const timers = await readMany<Timer>(timerKeys);
    const timer = timers
        .filter((timer): timer is Timer => timer !== undefined)
        .filter((timer) => timer.status)
        .find(
            (timer) =>
                timer.status!.channelId === messageReaction.message.channel.id &&
                timer.status!.messageId === messageReaction.message.id
        );

    if (!timer) {
        return;
    }

    switch (messageReaction.emoji.name) {
        case EMOJI_SKIP: {
            const config = await getConfig(timer.guildId);
            const nextAthleteIndex = timer.started ? (timer.athleteIndex + 1) % config.athletes.length : timer.athleteIndex;

            updateTimer({
                ...timer,
                nextChangeTime: getTime() + config.athletes[nextAthleteIndex].time,
                athleteIndex: nextAthleteIndex,
                started: true,
            });

            if (await hasManageMessagesPermissions(timer.guildId)) {
                messageReaction.users.remove(user.id);
            }

            const voiceConnection = await getVoiceConnection(config);
            if (voiceConnection) {
                speakCommand("skip", { nextAthlete: config.athletes[nextAthleteIndex].name }, voiceConnection);
            }

            break;
        }

        case EMOJI_PLUS10: {
            updateTimer({
                ...timer,
                nextChangeTime: timer.nextChangeTime + 10,
            });

            if (await hasManageMessagesPermissions(timer.guildId)) {
                messageReaction.users.remove(user.id);
            }

            break;
        }
    }
}
