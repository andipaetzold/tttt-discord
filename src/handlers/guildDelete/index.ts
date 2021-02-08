import { Guild } from "discord.js";
import { removeConfig } from "../../config";
import { stopTimer } from "../../timer";

export async function handleGuildDelete(guild: Guild) {
    await Promise.all([stopTimer(guild.id), removeConfig(guild.id)]);
}
