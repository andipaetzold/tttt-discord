import { Message } from "discord.js";
import { getConfig, setConfig } from "../../persistence/config";
import { parseMessage } from "../../util/message";
import { confirmMessage, isValidDelay, sendError } from "./util";

export async function delay(message: Message) {
    const { args } = parseMessage(message)!;

    await handleDelayCommand(args, message);
}

/**
 * @param message Content should not be parsed. Used to respond to command.
 */
export async function handleDelayCommand(args: string[], message: Message) {
    const config = await getConfig(message.guild!.id);

    if (args.length === 0) {
        await message.channel.send(`Start Delay: ${config.startDelay}s`);
        return;
    }

    const newStartDelay = +args[0];

    if (!isValidDelay(newStartDelay)) {
        await sendError("Invalid delay", message);
        return;
    }

    await setConfig({
        ...config,
        startDelay: newStartDelay,
    });

    await confirmMessage(message);
}
