import { entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import { environment } from "../environment";
import logger from "../services/logger";
import { requestStageSpeaker } from "./stageVoice";

export async function connectToChannel(channel: VoiceBasedChannel): Promise<VoiceConnection | undefined> {
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
    } catch (error) {
        try {
            connection.destroy();
        } catch {}
        return undefined;
    }

    await requestStageSpeaker(channel);
    connection.on("stateChange", (oldState, newState) => {
        if (
            oldState.status !== VoiceConnectionStatus.Ready
            && newState.status === VoiceConnectionStatus.Ready
            && connection.joinConfig.channelId === channel.id
        ) {
            void requestStageSpeaker(channel);
        }
    });
    return connection;
}
