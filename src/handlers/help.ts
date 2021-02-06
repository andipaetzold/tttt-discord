import type { TextChannel } from "discord.js";
import { PREFIX } from "../constants";

export async function help(channel: TextChannel) {
    await channel.send(`
Commands:
\`\`\`
${PREFIX}join                                : I'll join your voice channel
${PREFIX}leave                               : Leave the voice channel
${PREFIX}start                               : Start the timer
${PREFIX}stop                                : Stop the timer

${PREFIX}config                              : Get the current configuration
${PREFIX}config startDelay <number>          : Sets the start delay in seconds
${PREFIX}config athletes <name>:[<time>] ... : Set the athletes and their lead times

${PREFIX}help                                : Show this message
\`\`\`
*Made by Andi Pätzold*
Web App: <https://andipaetzold.github.io/tttt/>
Support this project: <https://paypal.me/andipaetzold>
`);
}
