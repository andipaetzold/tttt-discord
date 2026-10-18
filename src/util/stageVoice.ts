import { ChannelType, VoiceBasedChannel, PermissionFlagsBits } from "discord.js";
import logger from "../services/logger";

export async function requestStageSpeaker(channel: VoiceBasedChannel): Promise<void> {
    if (channel.type !== ChannelType.GuildStageVoice) {
        return;
    }

    try {
        const member = channel.guild.members.me;
        const voice = await member?.voice.fetch();
        if (!voice || voice.channelId !== channel.id || voice.suppress === null) {
            logger.warn(channel.guildId, "Could not determine Stage speaker state; a moderator may need to promote the bot");
            return;
        }
        if (!voice.suppress || voice.requestToSpeakTimestamp !== null) {
            return;
        }
        if (!channel.permissionsFor(member!)?.has(PermissionFlagsBits.RequestToSpeak)) {
            logger.warn(channel.guildId, "Missing Request to Speak permission; a moderator must promote the bot");
            return;
        }

        await voice.setRequestToSpeak(true);
    } catch (error) {
        logger.warn(channel.guildId, "Could not request to speak in the Stage; a moderator must promote the bot", error);
    }
}
