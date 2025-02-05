import type { ApplicationCommandData } from "discord.js";
import objectHash from "object-hash";
import { RedisClient } from "./redis";

export class SlashCommandHashRepository {
    #redisClient: RedisClient;
    #key: string;

    constructor(redisClient: RedisClient, botId: string) {
        this.#redisClient = redisClient;
        this.#key = `slash-command-hash:${botId}`;
    }

    async set(command: ApplicationCommandData) {
        const hash = objectHash(command);
        await this.#redisClient.write<string>(this.#key, hash);
    }

    async get(): Promise<string | undefined> {
        return await this.#redisClient.read<string>(this.#key);
    }
}
