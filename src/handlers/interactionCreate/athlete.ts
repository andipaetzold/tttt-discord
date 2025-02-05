import { ChatInputCommandInteraction } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import { configRepo } from "../../persistence/config";
import logger from "../../services/logger";
import { athleteToString } from "../../util/athleteToString";
import isSameAthlete from "../../util/isSameAthlete";
import parseUser from "../../util/parseUser";

export async function athlete(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!;
    const guildId = guild.id;
    const config = await configRepo.get(guild.id);

    const options = {
        athlete: interaction.options.getString(SLASH_COMMAND.commands.athlete.athlete, true),
        time: interaction.options.getInteger(SLASH_COMMAND.commands.athlete.time, true),
    };
    logger.info(guildId, `Options: ${JSON.stringify(options)}`);

    if (options.time <= 0) {
        await interaction.reply("Invalid time");
        return;
    }

    const parsedUser = await parseUser(options.athlete, guild);
    if (!config.athletes.some((a) => isSameAthlete(a, parsedUser))) {
        await interaction.reply(`${options.athlete} is not configured as an athlete`);
        return;
    }

    await configRepo.set({
        ...config,
        athletes: config.athletes.map((a) =>
            isSameAthlete(a, parsedUser)
                ? {
                      ...a,
                      time: options.time,
                  }
                : a
        ),
    });

    await interaction.reply(`Time of ${athleteToString(parsedUser)} set to ${options.time}s`);
}
