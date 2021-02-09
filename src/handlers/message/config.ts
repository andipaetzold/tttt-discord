import { Message, MessageEmbed, TextChannel } from "discord.js";
import { DEFAULT_PREFIX, DEFAULT_TIME_PER_ATHLETE } from "../../constants";
import { getConfig, setConfig } from "../../persistence/config";
import { Athlete } from "../../types";
import { EMOJI_ERROR, EMOJI_SUCCESS } from "../../util/emojis";
import isSameAthlete from "../../util/isSameAthlete";
import { parseMessage } from "../../util/message";
import parseUser from "../../util/parseUser";

export async function config(message: Message): Promise<void> {
    const { args } = parseMessage(message)!;

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
                await sendError(`${args[1]} is not a valid number`, message);
                return;
            }

            await setConfig({
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

            await setConfig({
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
    await message.react(EMOJI_SUCCESS);
}

async function sendError(text: string, message: Message): Promise<void> {
    await Promise.all([message.channel.send(text), message.react(EMOJI_ERROR)]);
}

function athleteToString(athlete: Pick<Athlete, "name" | "userId">): string {
    if (athlete.userId) {
        return `<@!${athlete.userId}>`;
    } else {
        return athlete.name;
    }
}
