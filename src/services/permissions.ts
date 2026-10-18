import { ChannelType, Guild, VoiceBasedChannel, OAuth2Scopes, PermissionFlagsBits } from "discord.js";
import { client } from "../discord";

export const REQUESTED_PERMISSIONS = [
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
    PermissionFlagsBits.RequestToSpeak,
] as const;

export function getInviteUrl(): string {
    return client.generateInvite({
        scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
        permissions: REQUESTED_PERMISSIONS,
    });
}

export function hasSendMessagePermission(guild: Guild) {
    return guild.members.me?.permissions.has(PermissionFlagsBits.SendMessages) ?? false;
}

export function hasVoicePermissions(channel: VoiceBasedChannel) {
    const member = channel.guild.members.me;
    if (!member) {
        return false;
    }
    const required =
        channel.type === ChannelType.GuildStageVoice
            ? [PermissionFlagsBits.Connect]
            : [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak];
    return channel.permissionsFor(member)?.has(required) ?? false;
}

export function hasManageMessagesPermissions(guild: Guild) {
    return guild.members.me?.permissions.has(PermissionFlagsBits.ManageMessages) ?? false;
}
