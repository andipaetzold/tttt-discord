import type { Guild } from "discord.js";
import logger from "../../services/logger";
import { REQUESTED_PERMISSIONS } from "../../services/permissions";

export async function handleGuildCreate(guild: Guild) {
    logger.info(guild.id, `Joined Guild "${guild.name}"`);

    logger.info(guild.id, "Permissions:");
    for (const permission of REQUESTED_PERMISSIONS) {
        const hasPermission = guild.me!.hasPermission(permission);
        logger.info(guild.id, `${permission}: ${hasPermission ? "yes" : "no"}`);
    }
}
