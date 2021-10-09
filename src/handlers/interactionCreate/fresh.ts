import { CommandInteraction } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import { getConfig } from "../../persistence/config";
import { getTimer } from "../../persistence/timer";
import logger from "../../services/logger";
import { updateStatusMessage } from "../../services/statusMessage";
import { setAthleteAsFresh } from "../../services/timer";
import { athleteToString } from "../../util/athleteToString";
import isSameAthlete from "../../util/isSameAthlete";
import parseUser from "../../util/parseUser";

export async function fresh(interaction: CommandInteraction) {
    const guild = interaction.guild!;
    const guildId = guild.id;

    const timer = await getTimer(guildId);
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
    const athleteIndex = config.athletes.findIndex((athlete) => isSameAthlete(athlete, user));

    if (athleteIndex === -1) {
        await interaction.reply({ content: "I am not sure who is feeling fresh again", ephemeral: true });
        return;
    }

    if (!timer.disabledAthletes.includes(athleteIndex)) {
        await interaction.reply({
            content: options.athlete ? "The athlete is already fresh" : "You are already fresh",
            ephemeral: true,
        });
        return;
    }

    await setAthleteAsFresh(guildId, athleteIndex);
    await updateStatusMessage(guildId);

    await interaction.reply(`${athleteToString(user)} is now fresh`);
}
