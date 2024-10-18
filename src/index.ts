import VRCGroup, { VRCGroupPermission } from "types/vrcgroup";
import {
  getNewLogs,
  groupIds,
  init,
  sendNewLogs,
  setValidGroups,
  vrcClient,
} from "vrchat";
import { REQUIRED_GROUP_PERMISSIONS } from "./constants";
import "./discord/bot";
import { sendMessage } from "./discord/rest";

(async () => {
  console.log("Starting up");
  await init();

  const groups = await Promise.all(
    groupIds.map(async (i) => {
      try {
        const data = await vrcClient.get(`/groups/${i}`);
        if (data.status !== 200) {
          throw new Error(`Error fetching group ${i}`);
        }
        if (!data.data) {
          throw new Error(`Error fetching group ${i}`);
        }
        return data.data as VRCGroup;
      } catch (e) {
        await sendMessage(
          process.env.DISCORD_CHANNEL_ID_LOGS!,
          `Error fetching group ${i}`
        );
        console.error(`Error fetching group ${i}`);
        console.error(e);
      }
    })
  );
  const validGroups: VRCGroup[] = [];
  for (const group of groups) {
    if (!group) {
      continue;
    }
    if (group.membershipStatus !== "member") {
      sendMessage(
        process.env.DISCORD_CHANNEL_ID_LOGS!,
        `Bot is not a member of group ${group.name}`
      );
      continue;
    }
    const missingPermissions = REQUIRED_GROUP_PERMISSIONS.filter(
      (permission: VRCGroupPermission) =>
        !group.myMember.permissions.includes(permission)
    );
    if (missingPermissions.length > 0) {
      sendMessage(
        process.env.DISCORD_CHANNEL_ID_LOGS!,
        `Bot is missing permissions in group ${group.name}: ${missingPermissions.join(", ")}`
      );
      continue;
    }
    validGroups.push(group);
  }
  await sendMessage(
    process.env.DISCORD_CHANNEL_ID_LOGS!,
    `Listening to the following groups:\n${validGroups.map((group) => `- ${group.name}`).join("\n")}`
  );
  setValidGroups(validGroups);
  setInterval(async () => {
    console.log("Checking for new logs");
    try {
      const logs = await getNewLogs();
      const newLogs = Array.from(logs.values()).reduce(
        (acc, i) => acc + i.length,
        0
      );
      console.log(`Found ${newLogs} new logs`);
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

  console.log("Started");
})();
