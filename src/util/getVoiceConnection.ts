import { VoiceChannel, VoiceConnection } from "discord.js";
import { client } from "../client";
import { getConfig, saveConfig } from "../config";
import { log } from "../log";

export async function getVoiceConnection(
    guildId: string,
    userVoiceChannel?: VoiceChannel
): Promise<VoiceConnection | undefined> {
    let connection: VoiceConnection | undefined = undefined;

    const config = await getConfig(guildId);

    connection = client.voice?.connections.find((c) => c.channel.guild.id === guildId);

    if (connection === undefined) {
        const voiceChannel = userVoiceChannel;
        if (voiceChannel) {
            connection = await voiceChannel.join();
            log("Connect", `VC:${connection.channel.id}`);
        }
    }

    if (connection === undefined) {
        if (config.voiceChannelId) {
            const channel = await client.channels.fetch(config.voiceChannelId);
            if (channel.type === "voice") {
                const voiceChannel = channel as VoiceChannel;
                connection = await voiceChannel.join();
                log("Connect", `VC:${connection.channel.id}`);
            }
        }
    }
    if (connection === undefined) {
        const guild = await client.guilds.fetch(guildId);
        const voiceChannels = guild.channels.cache.filter((channel) => channel.type === "voice");
        if (voiceChannels.size === 1) {
            const voiceChannel = voiceChannels.first()! as VoiceChannel;
            connection = await voiceChannel.join();
            log("Connect", `VC:${connection.channel.id}`);
        }
    }

    saveConfig(guildId, {
        ...config,
        voiceChannelId: connection?.channel.id,
    });

    return connection;
}
