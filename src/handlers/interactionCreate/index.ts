import { Interaction } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import logger from "../../services/logger";
import { HandlerProps } from "../../services/sentry";
import { reset } from "./reset";
import { athlete } from "./athlete";
import { athletes } from "./athletes";
import { delay } from "./delay";
import { fresh } from "./fresh";
import { help } from "./help";
import { language } from "./language";
import { plus } from "./plus";
import { skip } from "./skip";
import { start } from "./start";
import { stop } from "./stop";
import { toast } from "./toast";

const commandsMap = {
    [SLASH_COMMAND.commands.help]: help,
    [SLASH_COMMAND.commands.start]: start,
    [SLASH_COMMAND.commands.stop]: stop,
    [SLASH_COMMAND.commands.language.name]: language,
    [SLASH_COMMAND.commands.delay.name]: delay,
    [SLASH_COMMAND.commands.athlete.name]: athlete,
    [SLASH_COMMAND.commands.athletes.name]: athletes,
    [SLASH_COMMAND.commands.toast.name]: toast,
    [SLASH_COMMAND.commands.fresh.name]: fresh,
    [SLASH_COMMAND.commands.plus.name]: plus,
    [SLASH_COMMAND.commands.skip.name]: skip,
    [SLASH_COMMAND.commands.reset.name]: reset,
};

export async function handleInteractionCreate({ args: [interaction], scope }: HandlerProps<[Interaction]>) {
    if (!interaction.isChatInputCommand() || !interaction.inGuild()) {
        return;
    }
    const guildId = interaction.guildId;

    const commandName = interaction.options.getSubcommand();
    logger.info(guildId, `Slash Command: ${commandName}`);

    const command = commandsMap[commandName];
    if (command) {
        await command(interaction, scope);
    } else {
        await interaction.reply("Unsupported command");
    }
}
