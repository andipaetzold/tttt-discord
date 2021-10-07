import { Guild } from "discord.js";
import { Athlete } from "../types";

export default async function parseUser(s: string, guild: Guild): Promise<Pick<Athlete, "name" | "userId">> {
    if (s.startsWith(`<@`) && s.endsWith(`>`)) {
        const userId = s.slice(s.startsWith(`<@!`) ? 3 : 2, -1);

        const guildMember = await guild.members.fetch(userId)

        return {
            name: guildMember?.displayName,
            userId,
        };
    } else {
        return {
            name: s,
            userId: undefined,
        };
    }
}
