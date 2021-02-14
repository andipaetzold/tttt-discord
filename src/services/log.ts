export function log(message: any, context: string, level: "INFO" | "ERROR" = "INFO") {
    const logFn = level === "INFO" ? console.log : console.error;

    if (context) {
        logFn(`[${context}]`, message);
    } else {
        logFn(message);
    }
}
