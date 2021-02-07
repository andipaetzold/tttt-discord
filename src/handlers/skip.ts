import type { Message } from "discord.js";
import { getConfig } from "../config";
import { DEFAULT_PREFIX } from "../constants";
import { speakCommand } from "../speak";
import { getTimer, updateTimer } from "../timer";
import { EMOJI_ERROR, EMOJI_SUCCESS } from "../util/emojis";
import { getVoiceConnection } from "../util/getVoiceConnection";
import { getTime } from "../util/time";

export async function skip(message: Message): Promise<void> {
    const guildId = message.guild!.id
    const timer = await getTimer(guildId);

    if (timer === undefined) {
        await Promise.all([
            message.channel.send(`Start the timer first using \`${DEFAULT_PREFIX}start\``),
            message.react(EMOJI_ERROR),
        ]);
        return;
    }

    const config = await getConfig(guildId);
    const nextAthleteIndex = timer.started ? (timer.athleteIndex + 1) % config.athletes.length : timer.athleteIndex;

    await Promise.all([
        updateTimer({
            ...timer,
            lastChangeTime: getTime(),
            athleteIndex: nextAthleteIndex,
            started: true,
        }),
        message.react(EMOJI_SUCCESS),
    ]);

    const voiceConnection = await getVoiceConnection(config);
    if (voiceConnection) {
        await speakCommand("skip", { nextAthlete: config.athletes[nextAthleteIndex].name }, voiceConnection);
    }
}
