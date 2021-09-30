module.exports = {
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    testRegex: "^.+\\.spec\\.ts$",
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.json",
        },
    },
};
