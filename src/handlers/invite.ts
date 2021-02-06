import { Message } from "discord.js";
import { getInviteUrl } from "../permissions";

export async function invite(message: Message): Promise<void> {
    const url = await getInviteUrl();
    await message.channel.send(`<${url}>`);
}
