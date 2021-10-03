import type { Message } from "discord.js";
import { DEFAULT_PREFIX } from "../../constants";
import { getConfig } from "../../persistence/config";
import { timerExists } from "../../persistence/timer";
import { updateStatusMessage } from "../../services/statusMessage";
import { setAthleteAsToast } from "../../services/timer";
import { EMOJI_ERROR, EMOJI_SUCCESS } from "../../util/emojis";
import isSameAthlete from "../../util/isSameAthlete";
import { parseMessage } from "../../util/message";
import parseUser from "../../util/parseUser";

export async function toast(message: Message) {
    const { args } = parseMessage(message)!;
    const guildId = message.guild!.id;

    if (!(await timerExists(guildId))) {
        await Promise.all([
            message.channel.send(`Start the timer first using \`${DEFAULT_PREFIX} start\``),
            message.react(EMOJI_ERROR),
        ]);
        return;
    }

    const config = await getConfig(guildId);

    const user = args[0]
        ? parseUser(args[0], message.mentions)
        : { name: message.author.username, userId: message.author.id };
    const athleteIndex = config.athletes.findIndex((athlete) => isSameAthlete(athlete, user));

    if (athleteIndex === -1) {
        await Promise.all([message.channel.send("I am not sure who is feeling fresh again"), message.react(EMOJI_ERROR)]);
        return;
    }

    await Promise.all([setAthleteAsToast(guildId, athleteIndex), message.react(EMOJI_SUCCESS)]);
    await updateStatusMessage(guildId);
}
