import { createClient } from "redis";

const client = createClient({
    url: process.env.REDIS_TLS_URL,
});

export async function write<T = any>(key: string, value: T): Promise<void> {
    const stringified = JSON.stringify(value);

    await new Promise((resolve, reject) => {
        client.set(key, stringified, (err, reply) => {
            if (err) {
                reject(err);
            } else {
                resolve(reply);
            }
        });
    });
}

export async function read<T = any>(key: string): Promise<T | undefined> {
    return await new Promise((resolve, reject) => {
        client.get(key, (err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value ? JSON.parse(value) : undefined);
            }
        });
    });
}

export function createConfigKey(guildId: string): string {
    return `config/${guildId}`;
}
