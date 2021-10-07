import { Athlete } from "../types";

export function athleteToString(athlete: Pick<Athlete, "name" | "userId">): string {
    if (athlete.userId) {
        return `<@${athlete.userId}>`;
    } else {
        return athlete.name;
    }
}
