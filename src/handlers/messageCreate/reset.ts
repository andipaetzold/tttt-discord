import { Message } from "discord.js";
import { removeConfig } from "../../persistence/config";
import { stopTimer } from "../../services/timer";
import { EMOJI_SUCCESS } from "../../util/emojis";

export async function reset(message: Message): Promise<void> {
    const guildId = message.guild!.id;

    await Promise.all([stopTimer(guildId), removeConfig(guildId), message.react(EMOJI_SUCCESS)]);
}
