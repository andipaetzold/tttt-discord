import { Message, MessageEmbed, TextChannel } from "discord.js";
import { client } from "../discord";
import { getConfig } from "../persistence/config";
import { getAllTimers, getTimer, setTimer } from "../persistence/timer";
import type { Config, Timer } from "../types";
import { EMOJI_PLUS10, EMOJI_SKIP, EMOJI_TOAST } from "../util/emojis";
import logger from "./logger";
import { getNextAthleteIndex } from "./timer";

const DEFAULT_FOOTER = "Use `!t stop` to stop the timer.";

export function createStatusMessage(config: Config, timer: Timer): MessageEmbed {
    const currentAthlete = config.athletes[timer.currentAthleteIndex];

    let messageEmbed: MessageEmbed;
    if (timer.started) {
        const nextAthlete = config.athletes[getNextAthleteIndex(config, timer)];

        messageEmbed = new MessageEmbed()
            .setTitle(`${currentAthlete.name} (${currentAthlete.time}s)`)
            .addField("Next athlete", `${nextAthlete.name} (${nextAthlete.time}s)`)
            .setFooter(
                `Click ${EMOJI_PLUS10} to add 10 seconds and ${EMOJI_SKIP} to go to the next rider. Click ${EMOJI_TOAST} when you are dead.\n${DEFAULT_FOOTER}`
            );
    } else {
        messageEmbed = new MessageEmbed()
            .setTitle("Waiting for the start...")
            .addField("First athlete", `${currentAthlete.name} (${currentAthlete.time}s)`)
            .setFooter(
                `Click ${EMOJI_PLUS10} to add 10 seconds and ${EMOJI_SKIP} to start. Click ${EMOJI_TOAST} when you are dead.\n${DEFAULT_FOOTER}`
            );
    }

    messageEmbed.addField(
        "Toasted athletes",
        timer.disabledAthletes.length === 0
            ? "*Everybody's still fresh*"
            : config.athletes
                  .filter((_, ai) => timer.disabledAthletes.includes(ai))
                  .map((a) => `• ${a.name}`)
                  .join("\n")
    );

    return messageEmbed;
}

export async function sendStatusMessage(channel: TextChannel) {
    const guildId = channel.guild.id;
    const [config, timer] = await Promise.all([getConfig(guildId), getTimer(guildId)]);
    if (timer === undefined) {
        return;
    }

    let message: Message;
    try {
        message = await channel.send(createStatusMessage(config, timer));
        message.react(EMOJI_PLUS10);
        message.react(EMOJI_SKIP);
        message.react(EMOJI_TOAST);

        await setTimer({
            ...timer,
            status: {
                channelId: channel.id,
                messageId: message.id,
            },
        });
    } catch (e) {
        logger.error(guildId, "Could not send status message");
        logger.error(guildId, e);
    }
}

export async function updateStatusMessage(guildId: string) {
    const [config, timer] = await Promise.all([getConfig(guildId), getTimer(guildId)]);
    if (timer?.status === undefined) {
        return;
    }

    try {
        const channel = (await client.channels.fetch(timer.status.channelId)) as TextChannel;
        const message = await channel.messages.fetch(timer.status.messageId);
        await message.edit(createStatusMessage(config, timer));
    } catch (e) {
        logger.error(guildId, "Could not update status message", e);

        await setTimer({
            ...timer,
            status: undefined,
        });
    }
}

export async function deleteStatusMessage(guildId: string) {
    const timer = await getTimer(guildId);
    if (timer?.status === undefined) {
        return;
    }

    try {
        const channel = (await client.channels.fetch(timer.status.channelId)) as TextChannel;
        const message = await channel.messages.fetch(timer.status.messageId);
        await message.delete();
    } catch (e) {
        logger.error(guildId, "Could not delete status message", e);
    }
}

/**
 * Required to receive the `messageReactionAdd` event
 */
export async function fetchStatusMessages() {
    const timers = await getAllTimers();

    for (const timer of timers
        .filter((timer): timer is Timer => timer !== undefined)
        .filter((timer) => timer.status !== undefined)) {
        try {
            const channel = (await client.channels.fetch(timer.status!.channelId)) as TextChannel;
            channel.messages.fetch(timer.status!.messageId);
        } catch (e) {
            logger.error(timer!.guildId, "Error fetching status message", e);

            await setTimer({
                ...timer,
                status: undefined,
            });
        }
    }
}
