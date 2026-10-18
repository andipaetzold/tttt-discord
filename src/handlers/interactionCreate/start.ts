import { type Scope } from "@sentry/node";
import { ChatInputCommandInteraction, GuildMember, TextChannel } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import { configRepo } from "../../persistence";
import { timerRepo } from "../../persistence";
import logger from "../../services/logger";
import { getInviteUrl, hasVoicePermissions } from "../../services/permissions";
import { addTimer } from "../../services/timer";
import { getVoiceConnection } from "../../util/getVoiceConnection";
import { canSpeakInStage } from "../../util/stageVoice";

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

    const config = await configRepo.get(guildId);
    const connection = await getVoiceConnection(config, interaction.member as GuildMember);
    const voiceChannel = connection?.joinConfig.channelId
        ? await guild.channels.fetch(connection.joinConfig.channelId)
        : undefined;

    if (voiceChannel?.isVoiceBased() && !hasVoicePermissions(voiceChannel)) {
        connection?.destroy();
        const invite = getInviteUrl();
        await interaction.reply({
            content: `I don't have enough permissions to join the voice channel. Please use this link to grant more permissions: <${invite}>.`,
            flags: ["Ephemeral"],
        });
        return;
    }

    if (connection === undefined || !voiceChannel?.isVoiceBased()) {
        await interaction.reply({
            content: `I don't know which voice channel to join. Join a voice channel and run \`/${SLASH_COMMAND.name} start\` again.`,
            flags: ["Ephemeral"],
        });
        return;
    }

    await interaction.reply(
        canSpeakInStage(voiceChannel)
            ? "Timer started"
            : "Timer started. A Stage moderator must promote me to speaker before announcements can be heard."
    );
    await addTimer(guildId, interaction.channel as TextChannel, scope);
}
