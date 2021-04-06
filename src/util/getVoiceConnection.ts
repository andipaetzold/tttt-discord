import { VoiceChannel, VoiceConnection } from "discord.js";
import { client } from "../discord";
import { setConfig } from "../persistence/config";
import logger from "../services/logger";
import { Config } from "../types";

export async function getVoiceConnection(
    config: Config,
    userVoiceChannel?: VoiceChannel
): Promise<VoiceConnection | undefined> {
    let connection: VoiceConnection | undefined = undefined;

    connection = client.voice?.connections.find((c) => c.channel.guild.id === config.guildId);

    if (connection === undefined) {
        const voiceChannel = userVoiceChannel;
        if (voiceChannel) {
            connection = await joinIfJoinable(voiceChannel);
        }
    }

    if (connection === undefined) {
        if (config.voiceChannelId) {
            try {
                const channel = await client.channels.fetch(config.voiceChannelId);
                if (channel.type === "voice") {
                    const voiceChannel = channel as VoiceChannel;
                    connection = await joinIfJoinable(voiceChannel);
                }
            } catch (e) {
                logger.warn(config.guildId, `Error fetching channel ${config.voiceChannelId}: ${e}`);
            }
        }
    }
    if (connection === undefined) {
        const guild = await client.guilds.fetch(config.guildId);
        const voiceChannels = guild.channels.cache.filter((channel) => channel.type === "voice");
        if (voiceChannels.size === 1) {
            const voiceChannel = voiceChannels.first()! as VoiceChannel;
            connection = await joinIfJoinable(voiceChannel);
        }
    }

    if (config.voiceChannelId !== connection?.channel.id) {
        if (connection) {
            logger.info(connection.channel.guild.id, `Connected to VC:${connection.channel.id}`);
        }

        await setConfig({
            ...config,
            voiceChannelId: connection?.channel.id,
        });
    }

    return connection;
}

async function joinIfJoinable(channel: VoiceChannel): Promise<VoiceConnection | undefined> {
    if (channel.joinable) {
        return await channel.join();
    }
    return undefined;
}
