import { Message, VoiceChannel, VoiceConnection } from "discord.js";
import { client } from "../client";
import { getConfig, saveConfig } from "../config";
import { DEFAULT_PREFIX } from "../constants";
import { log } from "../log";
import { addTimer } from "../timer";

export async function start(message: Message, sendMessage: (message: string) => Promise<Message>): Promise<void> {
    const guildId = message.guild!.id;
    const connection = await getVoiceConnection(message);

    if (connection === undefined) {
        await sendMessage(`I don't know which voice channel to join. Join a voice channel and run \`${DEFAULT_PREFIX}start\` again.`);
        return;
    }

    log("Start", `G:${guildId}`);
    await message.react("🏁");

    await addTimer(guildId);
}

async function getVoiceConnection(message: Message): Promise<VoiceConnection | undefined> {
    let connection: VoiceConnection | undefined = undefined;

    const guildId = message.guild!.id;
    const config = await getConfig(guildId);

    connection = client.voice?.connections.find((c) => c.channel.guild.id === guildId);

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
        const voiceChannel = message.member!.voice.channel;
        if (voiceChannel) {
            connection = await voiceChannel.join();
            log("Connect", `VC:${connection.channel.id}`);
        }
    }

    if (connection === undefined) {
        const voiceChannels = message.guild!.channels.cache.filter((channel) => channel.type === "voice");
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
