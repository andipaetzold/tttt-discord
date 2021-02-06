import type { Message, TextChannel } from "discord.js";
import { getConfig, saveConfig } from "../config";
import { DEFAULT_TIME_PER_ATHLETE, PREFIX } from "../constants";

export async function config(message: Message, args: string[]): Promise<void> {
    if (args.length === 0) {
        await printConfig(message.channel as TextChannel);
    } else {
        await updateConfig(message, args);
    }
}

async function printConfig(channel: TextChannel): Promise<void> {
    const config = await getConfig(channel.guild.id);
    const text = `
Start Delay: ${config.startDelay}s

Athletes:
${config.athletes.map((athlete) => `• ${athlete.name} (${athlete.time}s)`).join("\n")}
`;
    await channel.send(text);
}

async function updateConfig(message: Message, args: string[]) {
    const config = await getConfig(message.guild!.id);

    switch (args[0]) {
        case "startDelay": {
            if (args.length === 1) {
                await message.channel.send(`Start Delay: ${config.startDelay}s`);
                return;
            }

            const newStartDelay = +args[1];

            if (isNaN(newStartDelay)) {
                await Promise.allSettled([message.channel.send(`"${args[1]} is not a valid number"`), message.react("🤷‍♂️")]);
                return;
            }

            await saveConfig(message.guild!.id, {
                ...config,
                startDelay: newStartDelay,
            });

            await message.react("✅");
            break;
        }

        case "athletes": {
            const athletes = args.slice(1);

            if (athletes.length === 0) {
                message.channel.send(config.athletes.map((athlete) => `• ${athlete.name} (${athlete.time}s)`).join("\n"));
                return;
            }

            if (athletes.length === 1) {
                message.channel.send("You can't ride a team time trial alone. Go and join a team!");
            }

            const splitAthletes = athletes.map((athlete) => athlete.split(":"));
            const newAthletes = splitAthletes.map(([name, time]) => ({
                name,
                time: isNaN(+time) ? DEFAULT_TIME_PER_ATHLETE : +time,
            }));

            await saveConfig(message.guild!.id, {
                ...config,
                athletes: newAthletes,
            });

            await message.react("✅");
            break;
        }

        default:
            await Promise.allSettled([
                message.channel.send(
                    `I am not sure what you want to do. Use \`${PREFIX}help\` for more details on how to use me.`
                ),
                message.react("🤷‍♂️"),
            ]);
            break;
    }
}
