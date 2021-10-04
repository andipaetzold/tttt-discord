import { VoiceChannel } from "discord.js";
import { joinVoiceChannel, entersState, VoiceConnectionStatus, VoiceConnection } from "@discordjs/voice";
import { BOT_ID } from "../constants";
import logger from "../services/logger";

export async function connectToChannel(channel: VoiceChannel): Promise<VoiceConnection | undefined> {
    if (!channel.joinable) {
        return undefined;
    }

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        group: BOT_ID,
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 3_000);
        logger.info(channel.guildId, `Joined VS:${channel.id}`);
        return connection;
    } catch (error) {
        try {
            connection.destroy();
        } catch {}
        return undefined;
    }
}
