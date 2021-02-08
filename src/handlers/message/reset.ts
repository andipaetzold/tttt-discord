import { Message } from "discord.js";
import { removeConfig } from "../../config";
import { stopTimer } from "../../timer";
import { EMOJI_SUCCESS } from "../../util/emojis";

export async function reset(message: Message): Promise<void> {
    const guildId = message.guild!.id;

    await Promise.all([stopTimer(guildId), removeConfig(guildId), message.react(EMOJI_SUCCESS)]);
}
