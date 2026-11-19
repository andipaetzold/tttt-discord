import { ChannelType, VoiceBasedChannel } from "discord.js";
import { hasVoicePermissions } from "../services/permissions";

export function canSpeak(channel: VoiceBasedChannel): boolean {
    const member = channel.guild.members.me;
    if (!member || member.voice.channelId !== channel.id || member.voice.mute !== false || !hasVoicePermissions(channel)) {
        return false;
    }

    switch (channel.type) {
        case ChannelType.GuildVoice:
            return channel.speakable;
        case ChannelType.GuildStageVoice:
            return member.voice.suppress === false && !member.isCommunicationDisabled();
        default:
            return false;
    }
}
