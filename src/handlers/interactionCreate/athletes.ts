import { CommandInteraction } from "discord.js";
import { range } from "lodash";
import { DEFAULT_TIME_PER_ATHLETE, SLASH_COMMAND } from "../../constants";
import { getConfig, setConfig } from "../../persistence/config";
import logger from "../../services/logger";
import { athleteToString } from "../../util/athleteToString";
import { isValidDelay } from "../../util/isValidDelay";
import parseUser from "../../util/parseUser";

export async function athletes(interaction: CommandInteraction) {
    const guild = interaction.guild!;
    const guildId = guild.id;
    const config = await getConfig(guild.id);

    const options = {
        athletes: range(1, SLASH_COMMAND.commands.athletes.athletesCount + 1).map((i) =>
            interaction.options.getString(`${SLASH_COMMAND.commands.athletes.athletesPrefix}${i}`, false)
        ),
        times: range(1, SLASH_COMMAND.commands.athletes.athletesCount + 1).map((i) =>
            interaction.options.getInteger(`${SLASH_COMMAND.commands.athletes.timePrefix}${i}`, false)
        ),
    };
    logger.info(guildId, `Options: ${JSON.stringify(options)}`);

    if (options.athletes.every((a) => a === null) && options.times.every((t) => t === null)) {
        await interaction.reply(
            config.athletes.map((athlete) => `• ${athleteToString(athlete)} (${athlete.time}s)`).join("\n")
        );
        return;
    }

    const athletes = await Promise.all(
        options.athletes
            .map((athlete, i) => ({ athlete, time: options.times[i] ?? DEFAULT_TIME_PER_ATHLETE }))
            .filter(({ athlete }) => athlete !== null)
            .map(({ athlete, time }) => ({ athlete, time: isValidDelay(time) ? time : DEFAULT_TIME_PER_ATHLETE }))
            .map(async ({ athlete, time }) => ({
                ...(await parseUser(athlete!, interaction.guild!).then(({ name, userId }) => ({ name, userId }))),
                time,
            }))
    );

    await setConfig({
        ...config,
        athletes,
    });

    await interaction.reply(`Athletes updated
${athletes.map((athlete) => `• ${athleteToString(athlete)} (${athlete.time}s)`).join("\n")}`);
}
