import { Message } from "discord.js";
import { Athlete } from "../../types";
import { EMOJI_ERROR, EMOJI_SUCCESS } from "../../util/emojis";

export function athleteToString(athlete: Pick<Athlete, "name" | "userId">): string {
    if (athlete.userId) {
        return `<@${athlete.userId}>`;
    } else {
        return athlete.name;
    }
}

export async function confirmMessage(message: Message): Promise<void> {
    await message.react(EMOJI_SUCCESS);
}

export async function sendError(text: string, message: Message): Promise<void> {
    await Promise.all([message.channel.send(text), message.react(EMOJI_ERROR)]);
}

export function isValidDelay(delay: number): boolean {
    if (delay < 0) {
        return false;
    }

    if (delay > 24 * 60 * 60) {
        return false;
    }

    if (isNaN(delay)) {
        return false;
    }

    return true;
}
