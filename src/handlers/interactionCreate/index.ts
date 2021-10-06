import { Interaction } from "discord.js";
import { SLASH_COMMAND } from "../../constants";
import logger from "../../services/logger";
import { HandlerProps } from "../../services/sentry";
import { help } from "./help";
import { stop } from "./stop";

const commandsMap = {
    [SLASH_COMMAND.commands.help]: help,
    [SLASH_COMMAND.commands.stop]: stop,
};

export async function handleInteractionCreate({ args: [interaction], scope }: HandlerProps<[Interaction]>) {
    if (!interaction.isCommand() || !interaction.inGuild()) {
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
