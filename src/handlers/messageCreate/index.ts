import { Message } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import { HandlerProps } from "../../services/sentry";

export async function handleMessageCreate({ args: [message] }: HandlerProps<[Message]>) {
    if (!message.member) {
        message.channel.send(
            `The timer can only be on servers/guilds - not in direct messages. Add me to a server/guild and type \`/${SLASH_COMMAND["name"]} help\` for more details.`
        );
        return;
    }
}
