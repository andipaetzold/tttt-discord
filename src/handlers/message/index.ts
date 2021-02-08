import { Message } from "discord.js";
import { DEFAULT_PREFIX } from "../../constants";
import { config } from "./config";
import { help } from "./help";
import { invite } from "./invite";
import { plus } from "./plus";
import { reset } from "./reset";
import { skip } from "./skip";
import { fresh } from "./fresh";
import { toast } from "./toast";
import { start } from "./start";
import { stop } from "./stop";
import { log } from "../../services/log";
import { parseMessage } from "../../util/message";
import { hasSendMessagePermission } from "../../services/permissions";

const commandsMap: { [command: string]: (message: Message) => Promise<void> } = {
    start,
    skip,
    fresh,
    toast,
    stop,
    config,
    reset,
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
            `The timer can only be on servers/guilds - not in direct messages. Add me to a server/guild and type \`${DEFAULT_PREFIX}help\` for more details.`
        );
        return;
    }

    if (!message.guild) {
        return;
    }

    if (!hasSendMessagePermission(message.guild)) {
        log("Missing SEND_MESSAGES permission", `G:${message.guild}`);
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
        await plus(message);
    }
}
