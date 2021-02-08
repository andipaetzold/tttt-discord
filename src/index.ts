import dotenv from "dotenv";
import { client } from "./discord";
import { handleDisconnect } from "./handlers/disconnect";
import { handleError } from "./handlers/error";
import { handleGuildCreate } from "./handlers/guildCreate";
import { handleGuildDelete } from "./handlers/guildDelete";
import { handleMessage } from "./handlers/message";
import { handleMessageReactionAdd } from "./handlers/MessageReactionAdd";
import { handleReady } from "./handlers/ready";
import { handleReconnecting } from "./handlers/reconnecting";

dotenv.config();

client.once("ready", handleReady);
client.once("reconnecting", handleReconnecting);
client.once("disconnect", handleDisconnect);
client.on("error", handleError);
client.on("message", handleMessage);
client.on("messageReactionAdd", handleMessageReactionAdd);
client.on("guildCreate", handleGuildCreate);
client.on("guildDelete", handleGuildDelete);

client.login(process.env.DISCORD_TOKEN);
