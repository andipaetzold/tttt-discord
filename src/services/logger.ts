function log(level: "INFO" | "WARN" | "ERROR", guildId: string | undefined, message: any, ...optionalParams: any[]) {
    let logFn: (message?: any, ...optionalParams: any[]) => void;
    switch (level) {
        case "INFO":
            logFn = console.log;
            break;

        case "WARN":
            logFn = console.warn;
            break;

        case "ERROR":
            logFn = console.error;
            break;
    }

    if (guildId === undefined) {
        console.log(`[Server]`, message, ...optionalParams);
    } else {
        console.log(`[G:${guildId}]`, message, ...optionalParams);
    }
}

const logger = {
    info: (guildId: string | undefined, message: any, ...optionalParams: any[]) => {
        log("INFO", guildId, message, ...optionalParams);
    },
    warn: (guildId: string | undefined, message: any, ...optionalParams: any[]) => {
        log("WARN", guildId, message, ...optionalParams);
    },
    error: (guildId: string | undefined, message: any, ...optionalParams: any[]) => {
        log("ERROR", guildId, message, ...optionalParams);
    },
};
export default logger;