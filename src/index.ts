import { getNewLogs, sendNewLogs } from "vrchat";
import "./discord/bot";
import { sendMessage } from "./discord/rest";

console.log("Starting up");

setInterval(async () => {
  console.log("Checking for new logs");
  try {
    const logs = await getNewLogs();
    console.log(`Found ${logs.length} new logs`);
    await sendNewLogs(logs);
  } catch (e) {
    console.error("Error fetching group logs");
    console.error(e);
    try {
      await sendMessage(
        process.env.DISCORD_CHANNEL_ID_LOGS!,
        "Error fetching group logs"
      );
      if (e instanceof Error) {
        await sendMessage(process.env.DISCORD_CHANNEL_ID_LOGS!, e.message);
        await sendMessage(
          process.env.DISCORD_CHANNEL_ID_LOGS!,
          e.stack ?? "no stack provided"
        );
      } else {
        await sendMessage(
          process.env.DISCORD_CHANNEL_ID_LOGS!,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (e as any).toString()
        );
      }
    } catch (e) {
      console.error("Error sending error message");
      console.error(e);
    }
  }
}, 1000 * 30);
