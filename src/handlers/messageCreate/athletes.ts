import { Message } from "discord.js";
import { DEFAULT_TIME_PER_ATHLETE } from "../../constants";
import { getConfig, setConfig } from "../../persistence/config";
import { parseMessage } from "../../util/message";
import parseUser from "../../util/parseUser";
import { athleteToString, confirmMessage, isValidDelay } from "./util";

export async function athletes(message: Message) {
    const { args } = parseMessage(message)!;

    await handleAthletesCommand(args, message);
}

/**
 * @param message Content should not be parsed. Used to respond to command.
 */
export async function handleAthletesCommand(args: string[], message: Message) {
    const config = await getConfig(message.guild!.id);

    if (args.length === 0) {
        await message.channel.send(
            config.athletes.map((athlete) => `• ${athleteToString(athlete)} (${athlete.time}s)`).join("\n")
        );
        return;
    }

    const athletes = args;

    const splitAthletes = athletes.map((athlete) => athlete.split(":"));
    const parsedAthleteNames = splitAthletes.map(([name]) => parseUser(name, message.mentions));
    const newAthletes = splitAthletes.map(([, time], athleteIndex) => ({
        ...parsedAthleteNames[athleteIndex],
        time: isValidDelay(+time) ? +time : DEFAULT_TIME_PER_ATHLETE,
    }));

    await setConfig({
        ...config,
        athletes: newAthletes,
    });

    await confirmMessage(message);
}
