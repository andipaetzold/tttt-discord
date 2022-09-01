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
    return guild.me?.permissions.has("SEND_MESSAGES") ?? false;
}

export function hasVoicePermissions(guild: Guild) {
    return guild.me?.permissions.has(["CONNECT", "SPEAK"]) ?? false;
}

export function hasManageMessagesPermissions(guild: Guild) {
    return guild.me?.permissions.has("MANAGE_MESSAGES") ?? false;
}
