export class ExclusiveTaskRunner<Key> {
    readonly #activeTasks = new Map<Key, symbol>();

    run(key: Key, task: () => Promise<void>): Promise<void> | undefined {
        if (this.#activeTasks.has(key)) {
            return;
        }

        const taskToken = Symbol();
        this.#activeTasks.set(key, taskToken);

        return this.#runTask(key, taskToken, task);
    }

    async #runTask(key: Key, taskToken: symbol, task: () => Promise<void>): Promise<void> {
        try {
            await task();
        } finally {
            if (this.#activeTasks.get(key) === taskToken) {
                this.#activeTasks.delete(key);
            }
        }
    }
}
