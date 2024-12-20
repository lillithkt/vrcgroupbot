const { execSync, exec } = require("child_process");
while (true) {
    console.log("Starting the bot...")
    // run /dist/index.js and check exit code
    let code = undefined;
    try {
    const process = execSync("node dist/index.js", { stdio: "inherit" });
    code = process.status;
    } catch (e) {
        code = e.status;
    }
    console.log(`Bot exited with code ${code}`);
    if (code === 42) {
        console.log("Restarting the bot...");
        continue;
    }
    console.log("Bot stopped.");
}