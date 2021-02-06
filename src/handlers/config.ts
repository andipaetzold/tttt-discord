import { Message, MessageEmbed, TextChannel } from "discord.js";
import { getConfig, saveConfig } from "../config";
import { DEFAULT_PREFIX, DEFAULT_TIME_PER_ATHLETE } from "../constants";

export async function config(message: Message, args: string[]): Promise<void> {
    if (args.length === 0) {
        await printConfig(message.channel as TextChannel);
    } else {
        await updateConfig(message, args);
    }
}

async function printConfig(channel: TextChannel): Promise<void> {
    const config = await getConfig(channel.guild.id);
    const embed = new MessageEmbed()
        .setDescription(`Use \`${DEFAULT_PREFIX}help\` to learn how to change the configuration`)
        .setTitle("Configuration")
        .addField("Start Delay", `Start Delay: ${config.startDelay}s`)
        .addField("Athletes", config.athletes.map((athlete) => `• ${athlete.name} (${athlete.time}s)`).join("\n"))
        .setFooter("Made by Andi Pätzold");
    await channel.send(embed);
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
                await sendError(`"${args[1]} is not a valid number"`, message);
                return;
            }

            await saveConfig(message.guild!.id, {
                ...config,
                startDelay: newStartDelay,
            });

            await confirmMessage(message);
            break;
        }

        case "athletes": {
            const athletes = args.slice(1);

            if (athletes.length === 0) {
                await message.channel.send(
                    config.athletes.map((athlete) => `• ${athlete.name} (${athlete.time}s)`).join("\n")
                );
                return;
            }

            if (athletes.length === 1) {
                await sendError("You can't ride a team time trial alone. Go and join a team!", message);
                return;
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

            await confirmMessage(message);
            break;
        }

        default: {
            if (config.athletes.map((a) => a.name).includes(args[0])) {
                const athleteName = args[0];
                const newTime = +args[1];
                if (isNaN(newTime)) {
                    await sendError(`"${args[1]} is not a valid number"`, message);
                    return;
                }

                await saveConfig(message.guild!.id, {
                    ...config,
                    athletes: config.athletes.map((a) =>
                        a.name === athleteName
                            ? {
                                  ...a,
                                  time: newTime,
                              }
                            : a
                    ),
                });
                await confirmMessage(message);
            } else {
                await sendError(
                    `I am not sure what you want to do. Use \`${DEFAULT_PREFIX}help\` for more details on how to update the configuration.`,
                    message
                );
            }
            break;
        }
    }
}

async function confirmMessage(message: Message): Promise<void> {
    await confirmMessage(message);
}

async function sendError(text: string, message: Message): Promise<void> {
    await Promise.all([message.channel.send(text), message.react("🤷‍♂️")]);
}
