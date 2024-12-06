import { environment } from "./environment";
import { client } from "./discord";
import { handleDisconnect } from "./handlers/disconnect";
import { handleError } from "./handlers/error";
import { handleGuildCreate } from "./handlers/guildCreate";
import { handleGuildDelete } from "./handlers/guildDelete";
import { handleInteractionCreate } from "./handlers/interactionCreate";
import { handleMessageCreate } from "./handlers/messageCreate";
import { handleMessageReactionAdd } from "./handlers/messageReactionAdd";
import { handleMessageReactionRemove } from "./handlers/messageReactionRemove";
import { handleReady } from "./handlers/ready";
import { handleReconnecting } from "./handlers/reconnecting";
import { redisClient } from "./persistence/redis-with-cache";
import logger from "./services/logger";
import { wrapHandler } from "./services/sentry";

async function main() {
    logger.info(undefined, "Initializing...");
    await redisClient.waitForConnection();

    client.once(...wrapHandler("ready", handleReady));
    client.once(...wrapHandler("reconnecting", handleReconnecting));
    client.once(...wrapHandler("disconnect", handleDisconnect));
    client.on(...wrapHandler("error", handleError));
    client.on(...wrapHandler("messageCreate", handleMessageCreate));
    client.on(...wrapHandler("messageReactionAdd", handleMessageReactionAdd));
    client.on(...wrapHandler("messageReactionRemove", handleMessageReactionRemove));
    client.on(...wrapHandler("guildCreate", handleGuildCreate));
    client.on(...wrapHandler("guildDelete", handleGuildDelete));
    client.on(...wrapHandler("interactionCreate", handleInteractionCreate));

    client.login(environment.discord.token);
}

main();
