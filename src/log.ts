export function log(message: string, context?: string) {
    if (context) {
        console.log(`[${context}] ${message}`);
    } else {
        console.log(message);
    }
}
