import { Message } from "discord.js";
import { PREFIXES } from "../constants";

const PREFIXES_WITH_SPACE = PREFIXES.map((p) => `${p} `);

export function parseMessage(message: Pick<Message, "content">): { command: string; args: string[] } | undefined {
    const trimmedContent = message.content.trim();

    // `!t`
    if (PREFIXES.includes(trimmedContent)) {
        return { command: "", args: [] };
    }

    const usedPrefix = PREFIXES_WITH_SPACE.find((prefix) => trimmedContent.startsWith(prefix));
    if (!usedPrefix) {
        return;
    }

    const strippedPrefix = trimmedContent.slice(usedPrefix.length);
    const splitMessage = strippedPrefix.split(" ").filter((s) => s.length !== 0);
    const command = splitMessage[0];
    const args = splitMessage.slice(1);

    return { command, args };
}
