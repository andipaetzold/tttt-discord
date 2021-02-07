import { Message, TextChannel } from "discord.js";
import { DEFAULT_PREFIX, PREFIXES } from "./constants";
import { config } from "./handlers/config";
import { help } from "./handlers/help";
import { invite } from "./handlers/invite";
import { reset } from "./handlers/reset";
import { start } from "./handlers/start";
import { stop } from "./handlers/stop";
import { skip } from "./handlers/skip";
import { log } from "./log";

const commandsMap: { [command: string]: (message: Message, args: string[]) => Promise<void> } = {
    start,
    stop,
    config,
    reset: (message) => reset(message.guild!.id, message),
    skip: (message) => skip(message.guild!.id, message),
    invite,
    help: (message) => help(message.channel as TextChannel),
};

export async function handleMessage(message: Message) {
    if (message.author.bot) {
        // ignore bot messages
        return;
    }

    if (!message.member) {
        message.channel.send(
            `The timer can only be used in voice channels - not in direct messages. Add me to a server/guild and type \`${DEFAULT_PREFIX}help\` for more details.`
        );
        return;
    }

    if (!message.guild) {
        return;
    }

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

    log(`Command: ${command} ${args}`, `TC:${message.channel.id}`);

    await commandsMap[command]?.(message, args);
}
