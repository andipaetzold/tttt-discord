import { Guild } from "discord.js";
import { removeConfig } from "../../persistence/config";
import { timerRepo } from "../../persistence/timer";
import logger from "../../services/logger";
import { HandlerProps } from "../../services/sentry";

export async function handleGuildDelete({ args: [guild] }: HandlerProps<[Guild]>) {
    logger.info(guild.id, `Left Guild "${guild.name}"`);
    await Promise.all([timerRepo.remove(guild.id), removeConfig(guild.id)]);
}
