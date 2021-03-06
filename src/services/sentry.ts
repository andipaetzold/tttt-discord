import * as Sentry from "@sentry/node";
import { SENTRY_DSN, SENTRY_ENVIRONMENT } from "../constants";
import logger from "./logger";

Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: SENTRY_ENVIRONMENT,
});

logger.info(undefined, `Sentry environment: ${SENTRY_ENVIRONMENT}`);

export function wrapHandler<T extends (...args: any[]) => Promise<void>>(
    handler: string,
    func: T
): [string, (...args: Parameters<T>) => Promise<void>] {
    const wrappedFunction = async (...args: Parameters<T>) => {
        Sentry.withScope(async (scope) => {
            scope.setTag("handler", handler);
            try {
                return await func(...args, scope);
            } catch (e) {
                logger.error(undefined, e);
                const eventId = Sentry.captureException(e, () => scope);
                logger.info(undefined, `Error captured as ${eventId}`);
            }
        });
    };

    return [handler, wrappedFunction];
}
