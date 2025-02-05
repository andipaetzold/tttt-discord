import { type Scope } from "@sentry/node";
import { ChatInputCommandInteraction } from "discord.js";
import { configRepo } from "../../persistence";
import { stopTimer } from "../../services/timer";

export async function reset(interaction: ChatInputCommandInteraction, scope: Scope) {
    const guildId = interaction.guild!.id;

    await Promise.all([stopTimer(guildId, scope), configRepo.remove(guildId), interaction.reply("Bot was reset")]);
}
