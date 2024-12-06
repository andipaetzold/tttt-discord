import { entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { VoiceChannel } from "discord.js";
import { environment } from "../environment";
import logger from "../services/logger";

export async function connectToChannel(channel: VoiceChannel): Promise<VoiceConnection | undefined> {
    if (!channel.joinable) {
        return undefined;
    }

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        group: environment.botId,
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 3_000);
        logger.info(channel.guildId, `Joined VC:${channel.id}`);
        return connection;
    } catch (error) {
        try {
            connection.destroy();
        } catch {}
        return undefined;
    }
}
