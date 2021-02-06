import { Message, TextChannel } from "discord.js";
import { PREFIX } from "./constants";
import { config } from "./handlers/config";
import { help } from "./handlers/help";
import { joinVoiceChannel } from "./handlers/joinVoiceChannel";
import { leaveVoiceChannel } from "./handlers/leaveVoiceChannel";
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
            `The timer can only be used in voice channels - not in direct messages. Add me to a server/guild and type \`${PREFIX}help\` for more details.`
        );
        return;
    }

    if (!message.guild) {
        return;
    }

    if (!message.content.startsWith(PREFIX)) {
        return;
    }

    const strippedPrefix = message.content.slice(PREFIX.length);
    const command = strippedPrefix.split(" ")[0];
    const args = strippedPrefix
        .split(" ")
        .slice(1)
        .filter((s) => s.length !== 0);

    log(`Command: ${command} ${args}`, `TC:${message.channel.id}`);

    switch (command) {
        case "join":
            await joinVoiceChannel(message.member.voice.channel, (text: string) => message.channel.send(text));
            break;

        case "leave":
            await leaveVoiceChannel(message.member.guild.id, (text: string) => message.channel.send(text));
            break;

        case "config":
            await config(message, args);
            break;

        case "start":
            await start(message, (text: string) => message.channel.send(text));
            break;

        case "stop":
            await stop(message, (text: string) => message.channel.send(text));
            break;

        case "help":
            await help(message.channel as TextChannel);
            break;

        default:
            await message.channel.send(`Unknown command. Type \`${PREFIX}help\` for more details.`);
            break;
    }
}
