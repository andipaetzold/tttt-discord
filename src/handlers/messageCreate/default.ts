import { Message, MessageEmbed, TextChannel } from "discord.js";
import { DEFAULT_PREFIX } from "../../constants";
import { LANGUAGES } from "../../languages";
import { getConfig } from "../../persistence/config";
import { athleteToString } from "./util";

export async function defaultCommand(message: Message) {
    await printConfig(message.channel as TextChannel);
}

export async function printConfig(channel: TextChannel): Promise<void> {
    const config = await getConfig(channel.guild.id);
    const embed = new MessageEmbed()
        .setDescription(`Use \`${DEFAULT_PREFIX} help\` to learn how to change the configuration`)
        .setTitle("Configuration")
        .addField("Start Delay", `${config.startDelay}s`)
        .addField(
            "Athletes",
            config.athletes.map((athlete) => `• ${athleteToString(athlete)} (${athlete.time}s)`).join("\n")
        )
        .addField("Language", LANGUAGES.find((language) => language.key === config.languageKey)!.name)
        .setFooter("Made by Andi Pätzold");
    await channel.send({ embeds: [embed] });
}
