import { Message } from "discord.js";
import { DEFAULT_PREFIX } from "../constants";
import { getTimer, updateTimer } from "../timer";
import { EMOJI_ERROR } from "../util/emojis";
import { parseMessage } from "../util/message";

export async function plus(message: Message): Promise<void> {
    const { command } = parseMessage(message)!;

    const time = +command.slice(1);
    if (isNaN(time)) {
        await Promise.all([message.channel.send(`"${command.slice(1)}" is not a valid time`), message.react(EMOJI_ERROR)]);
        return;
    }

    const timer = await getTimer(message.guild!.id);

    if (timer === undefined) {
        await Promise.all([
            message.channel.send(`Start the timer first using \`${DEFAULT_PREFIX}start\``),
            message.react(EMOJI_ERROR),
        ]);
        return;
    }

    await updateTimer({
        ...timer,
        lastChangeTime: timer.lastChangeTime + time,
    });
}
