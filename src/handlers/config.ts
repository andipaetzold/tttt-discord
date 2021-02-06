import { Message, MessageEmbed, TextChannel } from "discord.js";
import { client } from "../client";
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
        .addField(
            "Athletes",
            config.athletes.map((athlete) => `• ${athleteToString(athlete)} (${athlete.time}s)`).join("\n")
        )
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
                    config.athletes.map((athlete) => `• ${athleteToString(athlete)} (${athlete.time}s)`).join("\n")
                );
                return;
            }

            const splitAthletes = athletes.map((athlete) => athlete.split(":"));
            const parsedAthleteNames = await Promise.all(splitAthletes.map(([name]) => parseUser(name)));
            const newAthletes = splitAthletes.map(([, time], athleteIndex) => ({
                ...parsedAthleteNames[athleteIndex],
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
            const parsedUser = await parseUser(args[0]);

            if (config.athletes.some((a) => isSameAthlete(a, parsedUser))) {
                const newTime = +args[1];
                if (isNaN(newTime)) {
                    await sendError(`"${args[1]} is not a valid number"`, message);
                    return;
                }

                await saveConfig(message.guild!.id, {
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
    await message.react("✅");
}

async function sendError(text: string, message: Message): Promise<void> {
    await Promise.all([message.channel.send(text), message.react("🤷‍♂️")]);
}

async function parseUser(s: string): Promise<{ name: string; userId?: string }> {
    if (s.startsWith(`<@!`) && s.endsWith(`>`)) {
        const userId = s.slice(3, -1);
        const user = await client.users.fetch(userId);

        return {
            name: user.username,
            userId,
        };
    } else {
        return {
            name: s,
            userId: undefined,
        };
    }
}

function isSameAthlete(a: { name: string; userId?: string }, b: { name: string; userId?: string }): boolean {
    if (a.userId && b.userId) {
        return a.userId === b.userId;
    } else {
        return a.name === b.name;
    }
}

function athleteToString(athlete: { name: string; userId?: string }): string {
    if (athlete.userId) {
        return `<@!${athlete.userId}>`;
    } else {
        return athlete.name;
    }
}
