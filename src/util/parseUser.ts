import { client } from "../discord";
import { Athlete } from "../types";

export default async function parseUser(s: string): Promise<Pick<Athlete, "name" | "userId">> {
    if (s.startsWith(`<@!`) && s.endsWith(`>`)) {
        const userId = s.slice(3, -1);
        const user = await client.users.fetch(userId);

        return {
            name: user.username,
            userId,
        };
    } else {
        return {
            name: s,
            userId: undefined,
        };
    }
}
