import { Message, TextChannel } from "discord.js";
import { parseMessage } from "../../util/message";
import { handleAthleteCommand } from "./athlete";
import { handleAthletesCommand } from "./athletes";
import { printConfig } from "./default";
import { handleDelayCommand } from "./delay";
import { handleLanguageCommand } from "./language";

/**
 * @deprecated
 */
export async function config(message: Message): Promise<void> {
    const { args } = parseMessage(message)!;

    if (args.length === 0) {
        await printConfig(message.channel as TextChannel);
    } else {
        await updateConfig(message, args);
    }
}

async function updateConfig(message: Message, args: string[]) {
    switch (args[0].toLowerCase()) {
        case "delay":
        case "startdelay": {
            await handleDelayCommand(args.slice(1), message);
            break;
        }

        case "athletes": {
            await handleAthletesCommand(args.slice(1), message);
            break;
        }

        case "lang":
        case "language": {
            await handleLanguageCommand(args.slice(1), message);
            break;
        }

        default: {
            await handleAthleteCommand(args.slice(1), message);
            break;
        }
    }
}
