import { Guild } from "discord.js";
import { removeConfig } from "../../config";
import { log } from "../../services/log";
import { stopTimer } from "../../timer";

export async function handleGuildDelete(guild: Guild) {
    log(`Left ${guild.name}`, `G:${guild.id}`);
    await Promise.all([stopTimer(guild.id), removeConfig(guild.id)]);
}
