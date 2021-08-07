import { Guild } from "discord.js";
import { client } from "../discord";

export const REQUESTED_PERMISSIONS = ["SEND_MESSAGES", "MANAGE_MESSAGES", "CONNECT", "SPEAK"] as const;

const inviteUrlPromise = client.generateInvite({ scopes: ["bot"], permissions: REQUESTED_PERMISSIONS });
export async function getInviteUrl(): Promise<string> {
    return await inviteUrlPromise;
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
