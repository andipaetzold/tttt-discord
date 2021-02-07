import { Message } from "discord.js";
import { DEFAULT_PREFIX } from "./constants";
import { config } from "./handlers/config";
import { help } from "./handlers/help";
import { invite } from "./handlers/invite";
import { plus } from "./handlers/plus";
import { reset } from "./handlers/reset";
import { skip } from "./handlers/skip";
import { start } from "./handlers/start";
import { stop } from "./handlers/stop";
import { log } from "./log";
import { parseMessage } from "./util/message";

const commandsMap: { [command: string]: (message: Message) => Promise<void> } = {
    start,
    stop,
    config,
    reset,
    skip,
    invite,
    help,
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

    const parsedMessage = parseMessage(message);
    if (!parsedMessage) {
        return;
    }
    const { command, args } = parsedMessage;

    log(`Command: ${command} ${args}`, `TC:${message.channel.id}`);

    await commandsMap[command]?.(message);

    if (command.startsWith("+")) {
        plus(message);
    }
}
