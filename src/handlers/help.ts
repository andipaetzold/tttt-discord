import { MessageEmbed, TextChannel } from "discord.js";
import { DEFAULT_PREFIX } from "../constants";

export async function help(channel: TextChannel) {
    const embed = new MessageEmbed()
        .setTitle("Help")
        .setDescription(`If \`!t\` is already used by another bot, use \`!tttt\` as command prefix.`)
        .addField(`\`${DEFAULT_PREFIX}start\``, "Start the timer")
        .addField(`\`${DEFAULT_PREFIX}stop\``, "Stop the timer")

        .addField(`\`${DEFAULT_PREFIX}config\``, "Get the current configuration")
        .addField(`\`${DEFAULT_PREFIX}config startDelay <number>\``, "Sets the start delay in seconds")
        .addField(`\`${DEFAULT_PREFIX}config athletes <name>:[<time>] ...\``, "Set the athletes and their lead times")

        .addField(`\`${DEFAULT_PREFIX}reset\``, "Resets the bot")
        .addField(`\`${DEFAULT_PREFIX}help\``, "Show this message")
        .addField(
            "Links",
            `Web App: <https://andipaetzold.github.io/tttt/>
Support this project: <https://paypal.me/andipaetzold>`
        )
        .setFooter("Made by Andi Pätzold");

    await channel.send(embed);
}
