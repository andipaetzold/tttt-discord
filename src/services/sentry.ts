import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import { SENTRY_DSN, SENTRY_ENVIRONMENT } from "../constants";

Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: SENTRY_ENVIRONMENT,
});

export function wrapHandler<T extends (...args: any[]) => Promise<void>>(
    name: string,
    func: T
): [string, (...args: Parameters<T>) => Promise<void>] {
    const wrappedFunction = async (...args: Parameters<T>) => {
        const transaction = Sentry.startTransaction({
            name,
        });

        try {
            return await func(...args);
        } catch (e) {
            Sentry.captureException(e);
        } finally {
            transaction.finish();
        }
    };

    return [name, wrappedFunction];
}
