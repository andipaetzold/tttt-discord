import { Message, TextChannel } from "discord.js";
import { DEFAULT_PREFIX, PREFIXES } from "./constants";
import { config } from "./handlers/config";
import { help } from "./handlers/help";
import { reset } from "./handlers/reset";
import { start } from "./handlers/start";
import { stop } from "./handlers/stop";
import { log } from "./log";

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

    switch (command) {
        case "start":
            await start(message);
            break;

        case "stop":
            await stop(message);
            break;

        case "config":
            await config(message, args);
            break;

        case "reset":
            await reset(message.guild!.id, message);
            break;

        case "help":
            await help(message.channel as TextChannel);
            break;
    }
}
