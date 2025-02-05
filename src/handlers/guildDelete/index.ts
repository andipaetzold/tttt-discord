import { Guild } from "discord.js";
import { configRepo } from "../../persistence";
import { timerRepo } from "../../persistence";
import logger from "../../services/logger";
import { HandlerProps } from "../../services/sentry";

export async function handleGuildDelete({ args: [guild] }: HandlerProps<[Guild]>) {
    logger.info(guild.id, `Left Guild "${guild.name}"`);
    await Promise.all([timerRepo.remove(guild.id), configRepo.remove(guild.id)]);
}
