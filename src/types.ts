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
