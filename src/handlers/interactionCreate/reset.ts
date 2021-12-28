import { CommandInteraction } from "discord.js";
import { removeConfig } from "../../persistence/config";
import { stopTimer } from "../../services/timer";
import * as Sentry from "@sentry/node";

export async function reset(interaction: CommandInteraction, scope: Sentry.Scope) {
    const guildId = interaction.guild!.id;

    await Promise.all([stopTimer(guildId, scope), removeConfig(guildId), interaction.reply("Bot was reset")]);
}
