import { Message } from "discord.js";
import { DEFAULT_PREFIX } from "../../constants";
import logger from "../../services/logger";
import { hasSendMessagePermission } from "../../services/permissions";
import { HandlerProps } from "../../services/sentry";
import { parseMessage } from "../../util/message";
import { athlete } from "./athlete";
import { athletes } from "./athletes";
import { config } from "./config";
import { defaultCommand } from "./default";
import { delay } from "./delay";
import { fresh } from "./fresh";
import { help } from "./help";
import { invite } from "./invite";
import { language } from "./language";
import { plus } from "./plus";
import { reset } from "./reset";
import { skip } from "./skip";
import { start } from "./start";
import { stop } from "./stop";
import { toast } from "./toast";
import * as Sentry from "@sentry/node";

const commandsMap: { [command: string]: (message: Message, scope: Sentry.Scope) => Promise<void> } = {
    athlete,
    athletes,
    config,
    delay,
    fresh,
    help,
    invite,
    lang: language,
    language,
    reset,
    start,
    startdelay: delay,
    stop,
    skip,
    toast,
};

export async function handleMessageCreate({ args: [message], scope }: HandlerProps<[Message]>) {
    if (message.author.bot) {
        // ignore bot messages
        return;
    }

    if (!message.member) {
        message.channel.send(
            `The timer can only be on servers/guilds - not in direct messages. Add me to a server/guild and type \`${DEFAULT_PREFIX} help\` for more details.`
        );
        return;
    }

    if (!message.guild) {
        return;
    }

    if (!hasSendMessagePermission(message.guild)) {
        logger.info(message.guild.id, "Missing SEND_MESSAGES permission");
        return;
    }

    const parsedMessage = parseMessage(message);
    if (!parsedMessage) {
        return;
    }
    const { command, args } = parsedMessage;

    logger.info(message.guild.id, `Command: ${command} ${args}`);

    if (command === "") {
        // `!t`
        scope.setExtra("Command", { name: "default" });
        await defaultCommand(message);
    } else {
        const commandLowerCase = command.toLowerCase();

        const commandFn = commandsMap[commandLowerCase];
        if (commandFn) {
            scope.setExtra("Command", { name: commandLowerCase, args });
            await commandFn(message, scope);
        } else if (commandLowerCase.startsWith("+")) {
            scope.setExtra("Command", { name: "plus" });
            await plus(message);
        }
    }
}
