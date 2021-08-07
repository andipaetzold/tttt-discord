import { DISCORD_TOKEN } from "./constants";
import { client } from "./discord";
import { handleDisconnect } from "./handlers/disconnect";
import { handleError } from "./handlers/error";
import { handleGuildCreate } from "./handlers/guildCreate";
import { handleGuildDelete } from "./handlers/guildDelete";
import { handleMessageCreate } from "./handlers/messageCreate";
import { handleMessageReactionAdd } from "./handlers/messageReactionAdd";
import { handleMessageReactionRemove } from "./handlers/messageReactionRemove";
import { handleReady } from "./handlers/ready";
import { handleReconnecting } from "./handlers/reconnecting";
import logger from "./services/logger";
import { wrapHandler } from "./services/sentry";

logger.info(undefined, "Initializing...");

client.once(...wrapHandler("ready", handleReady));
client.once(...wrapHandler("reconnecting", handleReconnecting));
client.once(...wrapHandler("disconnect", handleDisconnect));
client.on(...wrapHandler("error", handleError));
client.on(...wrapHandler("messageCreate", handleMessageCreate));
client.on(...wrapHandler("messageReactionAdd", handleMessageReactionAdd));
client.on(...wrapHandler("messageReactionRemove", handleMessageReactionRemove));
client.on(...wrapHandler("guildCreate", handleGuildCreate));
client.on(...wrapHandler("guildDelete", handleGuildDelete));

client.login(DISCORD_TOKEN);
