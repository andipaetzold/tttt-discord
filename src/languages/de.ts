import { Language, VoiceCommands } from "./types";

const voiceCommands: VoiceCommands = {
    600: () => "10 Minuten",
    300: () => "5 Minuten",
    180: () => "3 Minuten",
    120: () => "2 Minuten",
    60: () => "1 Minute",
    30: () => "30 Sekunden",
    15: ({ nextAthlete }) => `${nextAthlete}. Mach dich bereit.`,
    10: ({ started }) => (started ? "Wechsel in 10" : "Start in 10"),
    5: () => "Fünf",
    2: () => "Zwei",
    1: () => "Eins",
    0: ({ nextAthlete, started }) => (started ? `Wechsel zu ${nextAthlete}` : "Los geht's"),
    skip: ({ nextAthlete }) => `Los ${nextAthlete}!`,
};

export const language: Language = {
    key: "de",
    name: "German",
    locale: "de-DE",
    voiceCommands,
};
