import { client } from "./client";

export async function getInviteUrl(): Promise<string> {
    return await client.generateInvite({
        permissions: ["SEND_MESSAGES", "CONNECT", "SPEAK"],
    });
}

export async function hasSendMessagePermission(guildId: string): Promise<boolean> {
    const guild = await client.guilds.fetch(guildId);
    return guild.me?.hasPermission("SEND_MESSAGES") ?? false;
}

export async function hasVoicePermissions(guildId: string): Promise<boolean> {
    const guild = await client.guilds.fetch(guildId);
    return guild.me?.hasPermission(["CONNECT", "SPEAK"]) ?? false;
}
