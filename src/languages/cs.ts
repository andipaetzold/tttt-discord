import { Language, VoiceCommands } from "./types";

const voiceCommands: VoiceCommands = {
    600: () => "10 minut",
    300: () => "5 minut",
    180: () => "3 minuty",
    120: () => "2 minuty",
    60: () => "1 minuta",
    30: () => "30 sekund",
    15: ({ nextAthlete }) => `${nextAthlete}. Připrav se.`,
    10: ({ started }) => (started ? "Změna za 10" : "Start za 10"),
    5: () => "Pět",
    2: () => "Dvě",
    1: () => "Jedna",
    0: ({ nextAthlete, started }) => (started ? `Na čelo jde ${nextAthlete}` : "Jdi"),
    skip: ({ nextAthlete }) => `Jeď ${nextAthlete}!`,
};

export const language: Language = {
    key: "cs",
    name: "Czech",
    locale: "cs-CZ",
    voiceCommands,
};
