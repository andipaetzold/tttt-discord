import { createClient } from "redis";
import { REDIS_URL } from "../constants";

const client = createClient({
    url: REDIS_URL,
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

export async function readMany<T = any>(keys: string[]): Promise<(T | undefined)[]> {
    if (keys.length === 0) {
        return [];
    }

    return await new Promise((resolve, reject) => {
        client.mget(keys, (err, values) => {
            if (err) {
                reject(err);
            } else {
                resolve(values.map((value) => (value ? JSON.parse(value) : undefined)));
            }
        });
    });
}

export async function keys(pattern: string): Promise<string[]> {
    return await new Promise((resolve, reject) => {
        client.keys(pattern, (err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        });
    });
}

export async function remove(key: string): Promise<void> {
    return await new Promise((resolve, reject) => {
        client.del(key, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export async function exists(key: string): Promise<boolean> {
    return await new Promise((resolve, reject) => {
        client.exists(key, (err, reply) => {
            if (err) {
                reject(err);
            } else {
                resolve(reply === 1);
            }
        });
    });
}
