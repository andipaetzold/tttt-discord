import { Message } from "discord.js";
import { getInviteUrl } from "../../services/permissions";

export async function invite(message: Message): Promise<void> {
    const url = getInviteUrl();
    await message.channel.send(`<${url}>`);
}
