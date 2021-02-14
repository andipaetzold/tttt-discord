import { Language as GoogleTTSLanguage } from "google-tts-api/dist/types";

export type VoiceCommands = Record<string, (args: Record<string, unknown>) => string>;

export type LanguageKey = "en" | "de" | "cs";
export interface Language {
    key: LanguageKey;
    name: string;
    locale: Locale;
    voiceCommands: VoiceCommands;
}

export type Locale = GoogleTTSLanguage;
