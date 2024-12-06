import { getVoiceConnection as getActiveVoiceConnection, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { ChannelType, GuildMember, VoiceChannel } from "discord.js";
import { environment } from "../environment";
import { client } from "../discord";
import { setConfig } from "../persistence/config";
import logger from "../services/logger";
import { Config } from "../types";
import { connectToChannel } from "./connectToChannel";

export async function getVoiceConnection(config: Config, member?: GuildMember): Promise<VoiceConnection | undefined> {
    const userVoiceChannel = member?.voice.channel?.type === ChannelType.GuildVoice ? member.voice.channel : undefined;

    const guild = await client.guilds.fetch(config.guildId);
    const voiceChannels = guild.channels
        .valueOf()
        .filter((channel): channel is VoiceChannel => channel.type === ChannelType.GuildVoice)
        .filter((channel) => channel.joinable);

    let connection: VoiceConnection | undefined = undefined;
    {
        // Rejoin currently active voice connection
        const guildConnection = getActiveVoiceConnection(config.guildId, environment.botId);
        if (guildConnection?.state.status === VoiceConnectionStatus.Ready) {
            connection = guildConnection;
        }
    }

    // Join current user
    if (connection === undefined && userVoiceChannel && userVoiceChannel.joinable) {
        connection = await connectToChannel(userVoiceChannel);
    }

    // Join persisted channel of a previous timer
    if (connection === undefined && config.voiceChannelId && voiceChannels.has(config.voiceChannelId)) {
        const channel = voiceChannels.get(config.voiceChannelId)!;
        if (channel) {
            connection = await connectToChannel(channel);
        }
    }

    // Join channel if it's the only one
    if (connection === undefined && voiceChannels.size === 1) {
        const voiceChannel = voiceChannels.first();
        if (voiceChannel) {
            connection = await connectToChannel(voiceChannel);
        }
    }

    // Actually join
    if (config.voiceChannelId !== connection?.joinConfig.channelId) {
        if (connection) {
            logger.info(connection.joinConfig.guildId, `Connected to VC:${connection.joinConfig.channelId}`);
        }

        await setConfig({ ...config, voiceChannelId: connection?.joinConfig.channelId ?? undefined });
    }

    return connection;
}
