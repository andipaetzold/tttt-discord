import { Message } from "discord.js";
import { PREFIXES } from "../constants";

export function parseMessage(message: Message): { command: string; args: string[] } | undefined {
    const usedPrefix = PREFIXES.find((prefix) => message.content.startsWith(prefix));
    if (!usedPrefix) {
        return;
    }

    const strippedPrefix = message.content.slice(usedPrefix.length);
    const command = strippedPrefix.split(" ")[0];
    const args = strippedPrefix
        .split(" ")
        .slice(1)
        .filter((s) => s.length !== 0);

    return { command, args };
}
