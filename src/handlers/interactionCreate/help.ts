import { CommandInteraction, MessageEmbed } from "discord.js";

export async function help(interaction: CommandInteraction) {
    const embed = new MessageEmbed()
        .setTitle("Help")
        .addField("Discord Server (Questions/Feedback)", "<https://discord.gg/SUccRhqswq>")
        .addField("Full Documentation", "<https://andipaetzold.github.io/tttt-discord/>")
        .addField("Web App", "<https://andipaetzold.github.io/tttt/>")
        .addField("Support this project", "<https://paypal.me/andipaetzold>")
        .setFooter({ text: "Made by Andi Pätzold" });

    await interaction.reply({ embeds: [embed] });
}
