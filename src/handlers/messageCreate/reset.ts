import { Message } from "discord.js";
import { removeConfig } from "../../persistence/config";
import { stopTimer } from "../../services/timer";
import { EMOJI_SUCCESS } from "../../util/emojis";
import * as Sentry from "@sentry/node";

export async function reset(message: Message, scope: Sentry.Scope): Promise<void> {
    const guildId = message.guild!.id;

    await Promise.all([stopTimer(guildId, scope), removeConfig(guildId), message.react(EMOJI_SUCCESS)]);
}
