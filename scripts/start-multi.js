const dotenv = require("dotenv");
const concurrently = require("concurrently");

dotenv.config();

const commands = [];
if (process.env.DISCORD_TOKEN) {
    commands.push({
        command: "npm start",
        env: {
            DISCORD_TOKEN: process.env.DISCORD_TOKEN,
            BOT_ID: 1,
        },
    });
} else {
    let i = 1;
    while (process.env[`DISCORD_TOKEN_${i}`]) {
        token = process.env[`DISCORD_TOKEN_${i}`];

        commands.push({
            command: "npm start",
            name: i.toString().padStart(2, " "),
            env: {
                DISCORD_TOKEN: token,
                BOT_ID: i,
            },
        });
        ++i;
    }
}

concurrently(commands);
