import { environment } from "./environment";

export const DEFAULT_ATHLETE_NAMES = ["Amelia", "Bowie", "Coco", "Dan", "Emma", "Finn", "Grace", "Henry", "Irene", "Jack"];

export const DEFAULT_START_DELAY = 0;
export const DEFAULT_TIME_PER_ATHLETE = 30;

export const EMPTY_VC_TIMEOUT = 60 * 60; // 60 minutes

// Slash Commands
export const SLASH_COMMAND = {
    name: `timer${environment.mainBot ? "" : environment.botId}`,
    commands: {
        start: "start",
        stop: "stop",
        help: "help",
        athlete: {
            name: "athlete",
            athlete: "athlete",
            time: "time",
        },
        language: {
            name: "language",
            language: "language",
        },
        delay: {
            name: "delay",
            delay: "delay",
        },
        athletes: {
            name: "athletes",
            athletesCount: 8,
            athletesPrefix: "athlete",
            timePrefix: "time",
        },
        toast: {
            name: "toast",
            athlete: "athlete",
        },
        fresh: {
            name: "fresh",
            athlete: "athlete",
        },
        skip: {
            name: "skip",
        },
        plus: {
            name: "plus",
            time: "time",
        },
        reset: {
            name: "reset",
        },
    },
};
