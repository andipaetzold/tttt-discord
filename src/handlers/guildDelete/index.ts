import { Guild } from "discord.js";
import { removeConfig } from "../../config";
import { log } from "../../services/log";
import { stopTimer } from "../../services/timer";

export async function handleGuildDelete(guild: Guild) {
    log(`Left Guild "${guild.name}"`, `G:${guild.id}`);
    await Promise.all([stopTimer(guild.id), removeConfig(guild.id)]);
}
