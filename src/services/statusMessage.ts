import { type Scope } from "@sentry/node";
import { EmbedBuilder, Message, TextChannel } from "discord.js";
import { SLASH_COMMAND } from "../constants";
import { client } from "../discord";
import { getConfig } from "../persistence/config";
import { timerRepo } from "../persistence/timer";
import type { Config, Timer } from "../types";
import { EMOJI_PLUS10, EMOJI_SKIP, EMOJI_TOAST } from "../util/emojis";
import isSameAthlete from "../util/isSameAthlete";
import logger from "./logger";
import { getNextAthleteIndex, isDisabledAthlete } from "./timer";

const DEFAULT_FOOTER = `Use \`/${SLASH_COMMAND["name"]} stop\` to stop the timer.`;

export function createStatusMessage(config: Config, timer: Timer): EmbedBuilder {
    const currentAthlete = config.athletes[timer.currentAthleteIndex];

    let embedBuilder: EmbedBuilder;
    if (timer.started) {
        const nextAthlete = config.athletes[getNextAthleteIndex(config, timer)];

        embedBuilder = new EmbedBuilder()
            .setTitle(`${currentAthlete.name} (change <t:${timer.nextChangeTime}:R>)`)
            .addFields([{ name: "Next athlete", value: `${nextAthlete.name} (${nextAthlete.time}s)` }])
            .setFooter({
                text: `Click ${EMOJI_PLUS10} to add 10 seconds and ${EMOJI_SKIP} to go to the next rider. Click ${EMOJI_TOAST} when you are dead.\n${DEFAULT_FOOTER}`,
            });
    } else {
        embedBuilder = new EmbedBuilder()
            .setTitle(`Waiting for the start <t:${timer.nextChangeTime}:R>`)
            .addFields([{ name: "First athlete", value: `${currentAthlete.name} (${currentAthlete.time}s)` }])
            .setFooter({
                text: `Click ${EMOJI_PLUS10} to add 10 seconds and ${EMOJI_SKIP} to start. Click ${EMOJI_TOAST} when you are dead.\n${DEFAULT_FOOTER}`,
            });
    }

    embedBuilder.addFields([
        {
            name: "Toasted athletes",
            value:
                timer.disabledAthletes.length === 0
                    ? "*Everybody's still fresh*"
                    : timer.disabledAthletes
                          .filter((disabledAthlete) =>
                              config.athletes.find((athlete) => isSameAthlete(disabledAthlete, athlete))
                          )
                          .map((a) => `• ${a.name}`)
                          .join("\n"),
        },
    ]);

    return embedBuilder;
}

export async function sendStatusMessage(channel: TextChannel, _scope: Scope) {
    const guildId = channel.guild.id;
    const [config, timer] = await Promise.all([getConfig(guildId), timerRepo.get(guildId)]);
    if (timer === undefined) {
        return;
    }

    let message: Message;
    try {
        message = await channel.send({ embeds: [createStatusMessage(config, timer)] });
        message.react(EMOJI_PLUS10);
        message.react(EMOJI_SKIP);
        message.react(EMOJI_TOAST);

        await timerRepo.update(guildId, (t) => ({
            ...t,
            status: {
                channelId: channel.id,
                messageId: message.id,
            },
        }));
    } catch (e) {
        logger.warn(guildId, "Could not send status message");
    }
}

export async function updateStatusMessage(guildId: string, _scope?: Scope) {
    const [config, timer] = await Promise.all([getConfig(guildId), timerRepo.get(guildId)]);
    if (timer?.status === undefined) {
        return;
    }

    try {
        const channel = (await client.channels.fetch(timer.status.channelId)) as TextChannel;
        const message = await channel.messages.fetch(timer.status.messageId);
        await message.edit({ embeds: [createStatusMessage(config, timer)] });
    } catch (e) {
        logger.warn(guildId, "Could not update status message");

        await timerRepo.update(timer.guildId, (t) => ({
            ...t,
            status: undefined,
        }));
    }
}

export async function deleteStatusMessage(guildId: string, _scope: Scope) {
    const timer = await timerRepo.get(guildId);
    if (timer?.status === undefined) {
        return;
    }

    try {
        const channel = (await client.channels.fetch(timer.status.channelId)) as TextChannel;
        const message = await channel.messages.fetch(timer.status.messageId);
        await message.delete();
    } catch (e) {
        logger.warn(guildId, "Could not delete status message");
    }
}
