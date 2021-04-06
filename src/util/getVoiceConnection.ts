import { VoiceChannel, VoiceConnection } from "discord.js";
import { client } from "../discord";
import { setConfig } from "../persistence/config";
import logger from "../services/logger";
import { Config } from "../types";

export async function getVoiceConnection(
    config: Config,
    userVoiceChannel?: VoiceChannel
): Promise<VoiceConnection | undefined> {
    const guild = await client.guilds.fetch(config.guildId);
    const voiceChannels = guild.channels
        .valueOf()
        .filter((channel) => channel.type === "voice")
        .filter((channel) => (channel as VoiceChannel).joinable);

    let connection: VoiceConnection | undefined = undefined;
    connection = client.voice?.connections.find((c) => c.channel.guild.id === config.guildId);

    if (connection === undefined && userVoiceChannel && userVoiceChannel.joinable) {
        connection = await userVoiceChannel.join();
    }

    if (connection === undefined && config.voiceChannelId && voiceChannels.has(config.voiceChannelId)) {
        const channel = voiceChannels.get(config.voiceChannelId)!;
        connection = await (channel as VoiceChannel).join();
    }

    if (connection === undefined && voiceChannels.size === 1) {
        const voiceChannel = voiceChannels.first()! as VoiceChannel;
        connection = await voiceChannel.join();
    }

    if (config.voiceChannelId !== connection?.channel.id) {
        if (connection) {
            logger.info(connection.channel.guild.id, `Connected to VC:${connection.channel.id}`);
        }

        await setConfig({ ...config, voiceChannelId: connection?.channel.id });
    }

    return connection;
}
