export interface Config {
    guildId: string;
    voiceChannelId?: string;
    startDelay: number;
    athletes: Athlete[];
}

export interface Athlete {
    name: string;
    time: number;
    userId?: string;
}

export interface Timer {
    guildId: string;
    lastChangeTime: number;
    athleteIndex: number;
    started: boolean;
    status?: {
        channelId: string;
        messageId: string;
    }
}
