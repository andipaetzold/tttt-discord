import type { Guild } from "discord.js";
import logger from "../../services/logger";
import { REQUESTED_PERMISSIONS } from "../../services/permissions";
import { HandlerProps } from "../../services/sentry";

export async function handleGuildCreate({ args: [guild] }: HandlerProps<[Guild]>) {
    logger.info(guild.id, `Joined Guild "${guild.name}"`);

    logger.info(guild.id, "Permissions:");
    for (const permission of REQUESTED_PERMISSIONS) {
        const hasPermission = guild.members.me!.permissions.has(permission);
        logger.info(guild.id, `${permission}: ${hasPermission ? "yes" : "no"}`);
    }
}
