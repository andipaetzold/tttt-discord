import { Message } from "discord.js";
import { getConfig, setConfig } from "../../persistence/config";
import isSameAthlete from "../../util/isSameAthlete";
import { parseMessage } from "../../util/message";
import parseUser from "../../util/parseUser";
import { confirmMessage, sendError } from "./util";

export async function athlete(message: Message) {
    const { args } = parseMessage(message)!;

    await handleAthleteCommand(args, message);
}

/**
 * @param message Content should not be parsed. Used to respond to command.
 */
export async function handleAthleteCommand(args: string[], message: Message) {
    const config = await getConfig(message.guild!.id);

    const parsedUser = parseUser(args[0], message.mentions);

    if (!config.athletes.some((a) => isSameAthlete(a, parsedUser))) {
        await sendError(`${args[0]} is not configured as an athlete`, message);
        return;
    }

    const newTime = +args[1];
    if (isNaN(newTime)) {
        await sendError(`${args[1]} is not a valid number`, message);
        return;
    }

    await setConfig({
        ...config,
        athletes: config.athletes.map((a) =>
            isSameAthlete(a, parsedUser)
                ? {
                      ...a,
                      time: newTime,
                  }
                : a
        ),
    });
    await confirmMessage(message);
}
