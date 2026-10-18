const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");

// Isolate network-facing dependencies without starting Discord or Redis clients.
module.exports = function loadModule(relativePath, mocks = {}, globals = {}) {
    const filename = path.resolve(__dirname, "../../dist", relativePath);
    const realRequire = createRequire(filename);
    const module = { exports: {} };
    vm.runInNewContext(fs.readFileSync(filename, "utf8"), {
        module,
        exports: module.exports,
        require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : realRequire(name),
        setTimeout,
        clearTimeout,
        console,
        ...globals,
    }, { filename });
    return module.exports;
};
