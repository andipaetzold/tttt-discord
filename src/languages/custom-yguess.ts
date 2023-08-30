import { Language, VoiceCommands } from "./types";

const voiceCommands: VoiceCommands = {
    0: () => "Set",
};

export const language: Language = {
    key: "custom-yguess",
    name: "Custom (yguess)",
    locale: "en-US",
    voiceCommands,
};
