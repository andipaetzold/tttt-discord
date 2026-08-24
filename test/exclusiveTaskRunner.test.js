const assert = require("node:assert/strict");
const test = require("node:test");
const { ExclusiveTaskRunner } = require("../dist/util/exclusiveTaskRunner");

test("runs only one task per key while retaining parallelism across keys", async () => {
    const runner = new ExclusiveTaskRunner();
    let releaseFirstTask;
    let replacementRuns = 0;
    let parallelRuns = 0;

    const firstTask = runner.run(
        "guild-a",
        () =>
            new Promise((resolve) => {
                releaseFirstTask = resolve;
            })
    );
    const staleReplacement = runner.run("guild-a", async () => {
        replacementRuns += 1;
    });
    const parallelTask = runner.run("guild-b", async () => {
        parallelRuns += 1;
    });

    assert.ok(firstTask);
    assert.equal(staleReplacement, undefined);
    assert.ok(parallelTask);
    await parallelTask;
    assert.equal(parallelRuns, 1);

    releaseFirstTask();
    await firstTask;

    const replacementTask = runner.run("guild-a", async () => {
        replacementRuns += 1;
    });
    assert.ok(replacementTask);
    await replacementTask;
    assert.equal(replacementRuns, 1);
});

test("releases the key when a task fails", async () => {
    const runner = new ExclusiveTaskRunner();

    const failedTask = runner.run("guild-a", async () => {
        throw new Error("tick failed");
    });
    assert.ok(failedTask);
    await assert.rejects(failedTask, /tick failed/);

    const retryTask = runner.run("guild-a", async () => {});
    assert.ok(retryTask);
    await retryTask;
});
