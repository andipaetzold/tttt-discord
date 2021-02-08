import type { Guild } from "discord.js";
import { log } from "../../services/log";

export async function handleGuildCreate(guild: Guild) {
    log(`Joined ${guild.name}`, `G:${guild.id}`);
}
