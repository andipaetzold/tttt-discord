import { Message } from "discord.js";
import { removeConfig } from "../config";
import { stopTimer } from "../timer";
import { EMOJI_SUCCESS } from "../util/emojis";

export async function reset(guildId: string, message?: Message): Promise<void> {
    stopTimer(guildId);
    await removeConfig(guildId);
    await stopTimer(guildId);

    await message?.react(EMOJI_SUCCESS);
}
