import { type Scope } from "@sentry/node";
import { ChatInputCommandInteraction, GuildMember, TextChannel } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import { configRepo } from "../../persistence/config";
import { timerRepo } from "../../persistence/timer";
import logger from "../../services/logger";
import { getInviteUrl, hasVoicePermissions } from "../../services/permissions";
import { addTimer } from "../../services/timer";
import { getVoiceConnection } from "../../util/getVoiceConnection";

export async function start(interaction: ChatInputCommandInteraction, scope: Scope) {
    const guild = interaction.guild!;
    const guildId = guild.id;

    if (await timerRepo.exists(guildId)) {
        logger.info(guildId, "Timer is already running");
        await interaction.reply({
            content: "Timer is already running",
            flags: ["Ephemeral"],
        });
        return;
    }

    if (!hasVoicePermissions(guild)) {
        const invite = getInviteUrl();
        await interaction.reply({
            content: `I don't have enough permissions to join the voice channel. Please use this link to grant more permissions: <${invite}>.`,
            flags: ["Ephemeral"],
        });
        return;
    }

    const config = await configRepo.get(guildId);
    const connection = await getVoiceConnection(config, interaction.member as GuildMember);

    if (connection === undefined) {
        await interaction.reply({
            content: `I don't know which voice channel to join. Join a voice channel and run \`/${SLASH_COMMAND.name} start\` again.`,
            flags: ["Ephemeral"],
        });
        return;
    }

    await interaction.reply("Timer started");
    await addTimer(guildId, interaction.channel as TextChannel, scope);
}
