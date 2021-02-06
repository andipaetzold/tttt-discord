import { Message } from "discord.js";
import { removeConfig } from "../config";
import { stopTimer } from "../timer";

export async function reset(guildId: string, message?: Message): Promise<void> {
    stopTimer(guildId);
    await removeConfig(guildId);

    await message?.react("✅");
}
