import { Language, VoiceCommands } from "./types";

const voiceCommands: VoiceCommands = {
    600: () => "10 minutes",
    300: () => "5 minutes",
    180: () => "3 minutes",
    120: () => "2 minutes",
    60: () => "1 minute",
    30: () => "30 seconds",
    15: ({ nextAthlete }) => `${nextAthlete}. Get ready.`,
    10: ({ started }) => (started ? "Change in 10" : "Start in 10"),
    5: () => "Five",
    2: () => "Two",
    1: () => "One",
    0: ({ nextAthlete, started }) => (started ? `Change to ${nextAthlete}` : "Let's go"),
    skip: ({ nextAthlete }) => `Go ${nextAthlete}!`,
};

export const language: Language = {
    key: "en",
    name: "English",
    locale: "en-US",
    voiceCommands,
};
