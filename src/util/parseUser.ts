import { MessageMentions } from "discord.js";
import { Athlete } from "../types";

export default function parseUser(s: string, messageMentions: MessageMentions): Pick<Athlete, "name" | "userId"> {
    if (s.startsWith(`<@`) && s.endsWith(`>`)) {
        const userId = s.slice(s.startsWith(`<@!`) ? 3 : 2, -1);

        const guildMember = messageMentions.members!.find((member) => member.user.id === userId)!;
        const name = guildMember.nickname ?? guildMember.user.username;

        return { name, userId };
    } else {
        return {
            name: s,
            userId: undefined,
        };
    }
}
