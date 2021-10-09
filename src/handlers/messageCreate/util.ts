import { Message } from "discord.js";
import { EMOJI_ERROR, EMOJI_SUCCESS } from "../../util/emojis";

export async function confirmMessage(message: Message): Promise<void> {
    await message.react(EMOJI_SUCCESS);
}

export async function sendError(text: string, message: Message): Promise<void> {
    await Promise.all([message.channel.send(text), message.react(EMOJI_ERROR)]);
}
