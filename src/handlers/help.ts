import type { TextChannel } from "discord.js";
import { DEFAULT_PREFIX } from "../constants";

export async function help(channel: TextChannel) {
    await channel.send(`
Commands:
\`\`\`
${DEFAULT_PREFIX}start                               : Start the timer
${DEFAULT_PREFIX}stop                                : Stop the timer

${DEFAULT_PREFIX}config                              : Get the current configuration
${DEFAULT_PREFIX}config startDelay <number>          : Sets the start delay in seconds
${DEFAULT_PREFIX}config athletes <name>:[<time>] ... : Set the athletes and their lead times

${DEFAULT_PREFIX}reset                               : Resets the bot
${DEFAULT_PREFIX}help                                : Show this message
\`\`\`
If \`!t\` is already used by another bot, use \`!tttt\` as command prefix.

*Made by Andi Pätzold*
Web App: <https://andipaetzold.github.io/tttt/>
Support this project: <https://paypal.me/andipaetzold>
`);
}
