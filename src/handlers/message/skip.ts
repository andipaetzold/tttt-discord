import type { Message } from "discord.js";
import { DEFAULT_PREFIX } from "../../constants";
import { updateStatusMessage } from "../../services/statusMessage";
import { hasTimer, skipCurrentAthlete } from "../../services/timer";
import { EMOJI_ERROR, EMOJI_SUCCESS } from "../../util/emojis";

export async function skip(message: Message): Promise<void> {
    const guildId = message.guild!.id;

    if (!(await hasTimer(guildId))) {
        await Promise.all([
            message.channel.send(`Start the timer first using \`${DEFAULT_PREFIX}start\``),
            message.react(EMOJI_ERROR),
        ]);
        return;
    }

    await Promise.all([skipCurrentAthlete(guildId), message.react(EMOJI_SUCCESS)]);

    await updateStatusMessage(guildId);
}
