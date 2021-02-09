import { Athlete } from "../types";

export default function isSameAthlete(a: Pick<Athlete, "name" | "userId">, b: Pick<Athlete, "name" | "userId">): boolean {
    if (a.userId && b.userId) {
        return a.userId === b.userId;
    } else {
        return a.name?.toLocaleLowerCase() === b.name?.toLocaleLowerCase();
    }
}
