import { MessageEmbed } from "discord.js";
import { Config, Timer } from "./types";

export function createStatusMessage(config: Config, timer: Timer): MessageEmbed {
    const currentAthlete = config.athletes[timer.athleteIndex];

    if (timer.started) {
        const nextAthlete = config.athletes[(timer.athleteIndex + 1) % config.athletes.length];

        return new MessageEmbed()
            .setTitle(`${currentAthlete.name} (${currentAthlete.time}s)`)
            .addField("Next athlete", `${nextAthlete.name} (${nextAthlete.time}s)`);
    } else {
        return new MessageEmbed()
            .setTitle("Waiting for the start...")
            .addField("First athlete", `${currentAthlete.name} (${currentAthlete.time}s)`);
    }
}
