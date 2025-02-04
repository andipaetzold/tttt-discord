import { ChatInputCommandInteraction } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import { getConfig } from "../../persistence/config";
import { getTimer } from "../../persistence/timer";
import logger from "../../services/logger";
import { updateStatusMessage } from "../../services/statusMessage";
import { setAthleteAsToast } from "../../services/timer";
import { athleteToString } from "../../util/athleteToString";
import isSameAthlete from "../../util/isSameAthlete";
import parseUser from "../../util/parseUser";

export async function toast(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!;
    const guildId = guild.id;

    const timer = await getTimer(guildId);
    if (!timer) {
        await interaction.reply(`Start the timer first using \`/${SLASH_COMMAND.name} start\``);
        return;
    }

    const options = {
        athlete: interaction.options.getString(SLASH_COMMAND.commands.toast.athlete, false),
    };
    logger.info(guildId, `Options: ${JSON.stringify(options)}`);

    const config = await getConfig(guild.id);

    const athleteToToast = options.athlete
        ? await parseUser(options.athlete, guild)
        : { name: interaction.member!.user.username, userId: interaction.member!.user.id };

    if (!config.athletes.find((athlete) => isSameAthlete(athlete, athleteToToast))) {
        await interaction.reply({
            content: "I am not sure who is feeling toasted",
            flags: ["Ephemeral"],
        });
        return;
    }

    if (timer.disabledAthletes.find((disabledAthlete) => isSameAthlete(disabledAthlete, athleteToToast))) {
        await interaction.reply({
            content: options.athlete ? "The athlete is already toasted" : "You are already toasted",
            flags: ["Ephemeral"],
        });
        return;
    }

    await setAthleteAsToast(guildId, athleteToToast);
    await updateStatusMessage(guildId);

    await interaction.reply(
        `${athleteToString(athleteToToast)} is now toasted. Use \`/${SLASH_COMMAND["name"]} fresh ${athleteToString(
            athleteToToast
        )}\` when ${athleteToString(athleteToToast)} is feeling good again.`
    );
}
