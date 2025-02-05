import { ChatInputCommandInteraction } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import { getConfig } from "../../persistence/config";
import logger from "../../services/logger";
import { updateStatusMessage } from "../../services/statusMessage";
import { setAthleteAsFresh } from "../../services/timer";
import { athleteToString } from "../../util/athleteToString";
import isSameAthlete from "../../util/isSameAthlete";
import parseUser from "../../util/parseUser";
import { timerRepo } from "../../persistence/timer";

export async function fresh(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!;
    const guildId = guild.id;

    const timer = await timerRepo.get(guildId);
    if (!timer) {
        await interaction.reply(`Start the timer first using \`/${SLASH_COMMAND.name} start\``);
        return;
    }

    const options = {
        athlete: interaction.options.getString(SLASH_COMMAND.commands.fresh.athlete, false),
    };
    logger.info(guildId, `Options: ${JSON.stringify(options)}`);

    const config = await getConfig(guild.id);

    const user = options.athlete
        ? await parseUser(options.athlete, guild)
        : { name: interaction.member!.user.username, userId: interaction.member!.user.id };

    const athleteToFresh = options.athlete
        ? await parseUser(options.athlete, guild)
        : { name: interaction.member!.user.username, userId: interaction.member!.user.id };

    if (!config.athletes.find((athlete) => isSameAthlete(athlete, athleteToFresh))) {
        await interaction.reply({
            content: "I am not sure who is feeling fresh again",
            flags: ["Ephemeral"],
        });
        return;
    }

    if (!timer.disabledAthletes.find((disabledAthlete) => isSameAthlete(disabledAthlete, athleteToFresh))) {
        await interaction.reply({
            content: options.athlete ? "The athlete is already fresh" : "You are already fresh",
            flags: ["Ephemeral"],
        });
        return;
    }

    await setAthleteAsFresh(guildId, athleteToFresh);
    await updateStatusMessage(guildId);

    await interaction.reply(`${athleteToString(user)} is now fresh`);
}
