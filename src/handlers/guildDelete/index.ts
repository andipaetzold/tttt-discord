import { Guild } from "discord.js";
import { log } from "../../services/log";
import { stopTimer } from "../../services/timer";
import { removeConfig } from "../../persistence/config";

export async function handleGuildDelete(guild: Guild) {
    log(`Left Guild "${guild.name}"`, `G:${guild.id}`);
    await Promise.all([stopTimer(guild.id), removeConfig(guild.id)]);
}
