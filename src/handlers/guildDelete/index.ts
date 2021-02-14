import { Guild } from "discord.js";
import { removeConfig } from "../../persistence/config";
import { removeTimer } from "../../persistence/timer";
import logger from "../../services/logger";

export async function handleGuildDelete(guild: Guild) {
    logger.info(guild.id, `Left Guild "${guild.name}"`);
    await Promise.all([removeTimer(guild.id), removeConfig(guild.id)]);
}
