import { Message, MessageEmbed } from "discord.js";
import { DEFAULT_PREFIX } from "../../constants";

export async function help(message: Message) {
    const embed = new MessageEmbed()
        .setTitle("Help")
        .setURL("https://andipaetzold.github.io/tttt-discord/")
        .addField("Full Documentation", "<https://andipaetzold.github.io/tttt-discord/>")
        .addField("Web App", "<https://andipaetzold.github.io/tttt/>")
        .addField("Support this project", "<https://paypal.me/andipaetzold>")
        .setFooter("Made by Andi Pätzold");

    await message.channel.send(embed);
}
