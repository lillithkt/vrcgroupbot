const { execSync } = require("child_process");
while (true) {
    console.log("Starting the bot...")
    // run /dist/index.js and check exit code
    const code = execSync("node index.js", { stdio: "inherit" }).status;
    console.log(`Bot exited with code ${code}`);
    if (code === 42) {
        console.log("Restarting the bot...");
        continue;
    }
    console.log("Bot stopped.");
}