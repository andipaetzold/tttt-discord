import type { ApplicationCommandData } from "discord.js";
import objectHash from "object-hash";
import { environment } from "../environment";
import { redisClient } from "./redis-with-cache";

const key = `slash-command-hash:${environment.botId}`;

export async function setSlashCommandHash(command: ApplicationCommandData) {
    const hash = objectHash(command);
    await redisClient.write<string>(key, hash);
}

export async function getSlashCommandHash(): Promise<string | undefined> {
    return await redisClient.read<string>(key);
}
