import { Message } from "discord.js";
import { PREFIXES } from "../constants";

export function parseMessage(message: Message): { command: string; args: string[] } | undefined {
    const usedPrefix = PREFIXES.find((prefix) => message.content.startsWith(prefix));
    if (!usedPrefix) {
        return;
    }

    const strippedPrefix = message.content.slice(usedPrefix.length);
    const splitMessage = strippedPrefix.split(" ").filter((s) => s.length !== 0);
    const command = splitMessage[0];
    const args = splitMessage.slice(1);

    return { command, args };
}
