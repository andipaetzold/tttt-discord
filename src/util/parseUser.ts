import { Guild, MessageMentions } from "discord.js";
import { Athlete } from "../types";

export default async function parseUser(s: string, guild: Guild): Promise<Pick<Athlete, "name" | "userId">> {
    const match = MessageMentions.UsersPattern.exec(s);
    if (match?.groups?.id) {
        const userId = match.groups.id;
        const guildMember = await guild.members.fetch(userId);

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
