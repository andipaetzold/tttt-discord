import { Message, MessageEmbed } from "discord.js";

export async function help(message: Message) {
    const embed = new MessageEmbed()
        .setTitle("Help")
        .addField("Discord Server (Questions/Feedback)", "<https://discord.gg/SUccRhqswq>")
        .addField("Full Documentation", "<https://andipaetzold.github.io/tttt-discord/>")
        .addField("Web App", "<https://andipaetzold.github.io/tttt/>")
        .addField("Support this project", "<https://paypal.me/andipaetzold>")
        .setFooter({ text: "Made by Andi Pätzold" });

    await message.channel.send({ embeds: [embed] });
}
