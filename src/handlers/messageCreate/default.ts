import { EmbedBuilder, Message, TextChannel } from "discord.js";
import { DEFAULT_PREFIX } from "../../constants";
import { LANGUAGES } from "../../languages";
import { getConfig } from "../../persistence/config";
import { athleteToString } from "../../util/athleteToString";

export async function defaultCommand(message: Message) {
    await printConfig(message.channel as TextChannel);
}

export async function printConfig(channel: TextChannel): Promise<void> {
    const config = await getConfig(channel.guild.id);
    const embed = new EmbedBuilder()
        .setDescription(`Use \`${DEFAULT_PREFIX} help\` to learn how to change the configuration`)
        .setTitle("Configuration")
        .addFields([
            {
                name: "Start Delay",
                value: `${config.startDelay}s`,
            },
            {
                name: "Athletes",
                value: config.athletes.map((athlete) => `• ${athleteToString(athlete)} (${athlete.time}s)`).join("\n"),
            },
            {
                name: "Language",
                value: LANGUAGES.find((language) => language.key === config.languageKey)!.name,
            },
        ])
        .setFooter({ text: "Made by Andi Pätzold" });
    await channel.send({ embeds: [embed] });
}
