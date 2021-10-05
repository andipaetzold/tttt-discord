import logger from "../../services/logger";
import { HandlerProps } from "../../services/sentry";

export async function handleError({ scope, args: [error] }: HandlerProps<[Error]>): Promise<void> {
    logger.error(undefined, error, scope);
}
