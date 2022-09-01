import { CommandInteraction } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import { getConfig } from "../../persistence/config";
import { getTimer } from "../../persistence/timer";
import logger from "../../services/logger";
import { updateStatusMessage } from "../../services/statusMessage";
import { setAthleteAsToast } from "../../services/timer";
import { athleteToString } from "../../util/athleteToString";
import isSameAthlete from "../../util/isSameAthlete";
import parseUser from "../../util/parseUser";

export async function toast(interaction: CommandInteraction) {
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

    const user = options.athlete
        ? await parseUser(options.athlete, guild)
        : { name: interaction.member!.user.username, userId: interaction.member!.user.id };
    const athleteIndex = config.athletes.findIndex((athlete) => isSameAthlete(athlete, user));

    if (athleteIndex === -1) {
        await interaction.reply({ content: "I am not sure who is feeling toasted", ephemeral: true });
        return;
    }

    if (timer.disabledAthletes.includes(athleteIndex)) {
        await interaction.reply({
            content: options.athlete ? "The athlete is already toasted" : "You are already toasted",
            ephemeral: true,
        });
        return;
    }

    await setAthleteAsToast(guildId, athleteIndex);
    await updateStatusMessage(guildId);

    await interaction.reply(
        `${athleteToString(user)} is now toasted. Use \`/${SLASH_COMMAND["name"]} fresh ${athleteToString(
            user
        )}\` when ${athleteToString(user)} is feeling good again.`
    );
}
