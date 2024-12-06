import { type Scope, init, setTags, withScope } from "@sentry/node";
import { environment } from "../environment";
import logger from "./logger";

export interface HandlerProps<Args extends any[]> {
    args: Args;
    scope: Scope;
}

init({
    dsn: environment.sentry.dsn,
    enabled: environment.sentry.dsn !== undefined,
    tracesSampleRate: 1.0,
    environment: environment.sentry.environment,
});

setTags({
    mainBot: environment.mainBot,
    botId: environment.botId,
});

logger.info(undefined, `Sentry environment: ${environment.sentry.environment}`);

export function wrapHandler<T extends (props: HandlerProps<any>) => Promise<void>>(
    handler: string,
    func: T
): [string, (...args: Parameters<T>) => Promise<void>] {
    const wrappedFunction = async (...args: Parameters<T>) => {
        withScope(async (scope) => {
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
