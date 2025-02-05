import { environment } from "../environment";
import { ConfigRepository } from "./config";
import { RedisClientWithCache } from "./redis-with-cache";
import { TimerRepository } from "./timer";
import { SlashCommandHashRepository } from "./command";

export const redisClient = new RedisClientWithCache(environment.redis.url);
export const slashCommandHashRepo = new SlashCommandHashRepository(redisClient, environment.botId);
export const timerRepo = new TimerRepository(redisClient);
export const configRepo = new ConfigRepository(redisClient);
