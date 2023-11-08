import type { ApplicationCommandData } from "discord.js";
import objectHash from "object-hash";
import { BOT_ID } from "../constants";
import { redisClient } from "./redis";

const key = `slash-command-hash:${BOT_ID}`;

export async function setSlashCommandHash(command: ApplicationCommandData) {
    const hash = objectHash(command);
    await redisClient.write<string>(key, hash);
}

export async function getSlashCommandHash(): Promise<string | undefined> {
    return await redisClient.read<string>(key);
}
