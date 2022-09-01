import { EmbedBuilder, Message } from "discord.js";

export async function help(message: Message) {
    const embed = new EmbedBuilder()
        .setTitle("Help")
        .addFields([
            {
                name: "Discord Server (Questions/Feedback)",
                value: "<https://discord.gg/SUccRhqswq>",
            },
            {
                name: "Full Documentation",
                value: "<https://andipaetzold.github.io/tttt-discord/>",
            },
            {
                name: "Web App",
                value: "<https://andipaetzold.github.io/tttt/>",
            },
            {
                name: "Support this project",
                value: "<https://paypal.me/andipaetzold>",
            },
        ])
        .setFooter({ text: "Made by Andi Pätzold" });

    await message.channel.send({ embeds: [embed] });
}
