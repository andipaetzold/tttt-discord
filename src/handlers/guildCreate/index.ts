import type { Guild } from "discord.js";
import { log } from "../../services/log";
import { REQUESTED_PERMISSIONS } from "../../services/permissions";

export async function handleGuildCreate(guild: Guild) {
    log(`Joined Guild "${guild.name}"`, `G:${guild.id}`);

    log("Permissions:", `G:${guild.id}`);
    for (const permission of REQUESTED_PERMISSIONS) {
        const hasPermission = guild.me!.hasPermission(permission);
        log(`${permission}: ${hasPermission ? "yes" : "no"}`, `G:${guild.id}`);
    }
}
