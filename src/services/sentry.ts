import * as Sentry from "@sentry/node";
import { BOT_ID, MAIN_BOT, SENTRY_DSN, SENTRY_ENVIRONMENT } from "../constants";
import logger from "./logger";

export interface HandlerProps<Args extends any[]> {
    args: Args;
    scope: Sentry.Scope;
}

Sentry.init({
    dsn: SENTRY_DSN,
    enabled: SENTRY_DSN !== undefined,
    tracesSampleRate: 1.0,
    environment: SENTRY_ENVIRONMENT,
});

Sentry.setTags({
    mainBot: MAIN_BOT,
    botId: BOT_ID,
});

logger.info(undefined, `Sentry environment: ${SENTRY_ENVIRONMENT}`);

export function wrapHandler<T extends (props: HandlerProps<any>) => Promise<void>>(
    handler: string,
    func: T
): [string, (...args: Parameters<T>) => Promise<void>] {
    const wrappedFunction = async (...args: Parameters<T>) => {
        Sentry.withScope(async (scope) => {
            scope.setTag("handler", handler);
            try {
                return await func({ args, scope });
            } catch (e: any) {
                logger.error(undefined, e, scope);
            }
        });
    };

    return [handler, wrappedFunction];
}
