import { Guild, OAuth2Scopes, PermissionFlagsBits } from "discord.js";
import { client } from "../discord";

export const REQUESTED_PERMISSIONS = [
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
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

export function hasVoicePermissions(guild: Guild) {
    return guild.members.me?.permissions.has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]) ?? false;
}

export function hasManageMessagesPermissions(guild: Guild) {
    return guild.members.me?.permissions.has(PermissionFlagsBits.ManageMessages) ?? false;
}
