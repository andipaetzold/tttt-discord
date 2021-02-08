import { Message } from "discord.js";
import { DEFAULT_PREFIX } from "../../constants";
import { addTimeToCurrentAthlete, hasTimer } from "../../services/timer";
import { EMOJI_ERROR, EMOJI_SUCCESS } from "../../util/emojis";
import { parseMessage } from "../../util/message";

export async function plus(message: Message): Promise<void> {
    const { command } = parseMessage(message)!;
    const guildId = message.guild!.id;

    const time = +command.slice(1);
    if (isNaN(time)) {
        await Promise.all([message.channel.send(`"${command.slice(1)}" is not a valid time`), message.react(EMOJI_ERROR)]);
        return;
    }

    if (!(await hasTimer(guildId))) {
        await Promise.all([
            message.channel.send(`Start the timer first using \`${DEFAULT_PREFIX}start\``),
            message.react(EMOJI_ERROR),
        ]);
        return;
    }

    await Promise.all([addTimeToCurrentAthlete(guildId, time), message.react(EMOJI_SUCCESS)]);
}
