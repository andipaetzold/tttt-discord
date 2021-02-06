export interface Config {
    guildId: string;
    voiceChannelId?: string;
    startDelay: number;
    athletes: {
        name: string;
        time: number;
    }[];
}
