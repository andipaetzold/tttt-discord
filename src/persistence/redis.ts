import { createClient } from "redis";
import { REDIS_URL } from "../constants";

const client = createClient({
    url: REDIS_URL,
});
const connected = (async () => {
    await client.connect();
    await client.ping();
})();

export async function write<T = any>(key: string, value: T): Promise<void> {
    const stringified = JSON.stringify(value);
    await connected;
    await client.set(key, stringified);
}

export async function read<T = any>(key: string): Promise<T | undefined> {
    await connected;
    const value = await client.get(key);
    return value ? JSON.parse(value) : undefined;
}

export async function readMany<T = any>(keys: string[]): Promise<(T | undefined)[]> {
    if (keys.length === 0) {
        return [];
    }

    await connected;
    const values = await client.mGet(keys);
    return values.map((value) => (value ? JSON.parse(value) : undefined));
}

export async function keys(pattern: string): Promise<string[]> {
    await connected;
    return await client.keys(pattern);
}

export async function remove(key: string): Promise<void> {
    await connected;
    await client.del(key);
}

export async function exists(key: string): Promise<boolean> {
    await connected;
    return await client.exists(key);
}
