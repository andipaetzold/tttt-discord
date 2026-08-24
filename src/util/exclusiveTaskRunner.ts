export class ExclusiveTaskRunner<Key> {
    readonly #activeTasks = new Map<Key, symbol>();

    run(key: Key, task: () => Promise<void>): Promise<void> | undefined {
        if (this.#activeTasks.has(key)) {
            return;
        }

        const taskToken = Symbol();
        this.#activeTasks.set(key, taskToken);

        return Promise.resolve().then(task).finally(() => {
            if (this.#activeTasks.get(key) === taskToken) {
                this.#activeTasks.delete(key);
            }
        });
    }
}
