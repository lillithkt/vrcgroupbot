import { getNewLogs, sendNewLogs } from "vrchat";

console.log("Starting up");

setInterval(async () => {
  console.log("Checking for new logs");
  const logs = await getNewLogs();
  console.log(`Found ${logs.length} new logs`);
  await sendNewLogs(logs);
}, 1000 * 30);
