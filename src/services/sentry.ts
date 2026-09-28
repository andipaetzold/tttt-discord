import { type Scope, init, setAttributes, setTags, withScope } from "@sentry/node";
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
    attachStacktrace: false,
    dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: {
            request: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
            response: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
        },
        httpBodies: [],
        urlQueryParams: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
        genAI: { inputs: false, outputs: false },
        databaseQueryData: false,
        graphQL: { document: false, variables: false },
        frameContextLines: 7,
    },
});

const botContext = {
    mainBot: environment.mainBot,
    botId: environment.botId,
};

setTags(botContext);
setAttributes(botContext);

logger.info(undefined, `Sentry environment: ${environment.sentry.environment}`);

export function wrapHandler<T extends (props: HandlerProps<any>) => Promise<void>>(
    handler: string,
    func: T
): [string, (...args: Parameters<T>) => Promise<void>] {
    const wrappedFunction = async (...args: Parameters<T>) => {
        withScope(async (scope) => {
            scope.setTag("handler", handler);
            scope.setAttribute("handler", handler);
            try {
                return await func({ args, scope });
            } catch (e: any) {
                logger.error(undefined, e, scope);
            }
        });
    };

    return [handler, wrappedFunction];
}
