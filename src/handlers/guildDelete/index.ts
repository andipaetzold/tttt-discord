import { Guild } from "discord.js";
import { removeConfig } from "../../persistence/config";
import { removeTimer } from "../../persistence/timer";
import { log } from "../../services/log";

export async function handleGuildDelete(guild: Guild) {
    log(`Left Guild "${guild.name}"`, `G:${guild.id}`);
    await Promise.all([removeTimer(guild.id), removeConfig(guild.id)]);
}
