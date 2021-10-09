export function isValidDelay(delay: number): boolean {
    if (delay < 0) {
        return false;
    }

    if (delay > 24 * 60 * 60) {
        return false;
    }

    if (isNaN(delay)) {
        return false;
    }

    return true;
}
