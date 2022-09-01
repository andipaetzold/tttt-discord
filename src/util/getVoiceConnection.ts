import { getVoiceConnection as getActiveVoiceConnection, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { ChannelType, GuildMember, VoiceChannel } from "discord.js";
import { BOT_ID } from "../constants";
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
        const guildConnection = getActiveVoiceConnection(config.guildId, BOT_ID);
        if (guildConnection?.state.status === VoiceConnectionStatus.Ready) {
            connection = guildConnection;
        }
    }

    if (connection === undefined && userVoiceChannel && userVoiceChannel.joinable) {
        connection = await connectToChannel(userVoiceChannel);
    }

    if (connection === undefined && config.voiceChannelId && voiceChannels.has(config.voiceChannelId)) {
        const channel = voiceChannels.get(config.voiceChannelId)!;
        if (channel) {
            connection = await connectToChannel(channel);
        }
    }

    if (connection === undefined && voiceChannels.size === 1) {
        const voiceChannel = voiceChannels.first();
        if (voiceChannel) {
            connection = await connectToChannel(voiceChannel);
        }
    }

    if (config.voiceChannelId !== connection?.joinConfig.channelId) {
        if (connection) {
            logger.info(connection.joinConfig.guildId, `Connected to VC:${connection.joinConfig.channelId}`);
        }

        await setConfig({ ...config, voiceChannelId: connection?.joinConfig.channelId ?? undefined });
    }

    return connection;
}
