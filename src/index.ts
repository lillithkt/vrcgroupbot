import { CapabilityPermissionRequirements } from "capabilities";
import config from "config";
import { login } from "discord/bot";
import VRCGroup, { VRCGroupPermission } from "types/vrcgroup";
import {
  getNewLogs,
  init,
  sendNewLogs,
  setValidGroups,
  vrcClient,
} from "vrchat";
import "./capabilities/list";
import { sendMessage } from "./discord/rest";

(async () => {
  console.log("Starting up");
  await init();

  const groups = await Promise.all(
    Object.keys(config.config.vrchat.groupIds).map(async (i) => {
      try {
        const data = await vrcClient.get(`/groups/${i}?includeRoles=true`);
        if (data.status !== 200) {
          throw new Error(`Error fetching group ${i}`);
        }
        if (!data.data) {
          throw new Error(`Error fetching group ${i}`);
        }
        return data.data as VRCGroup;
      } catch (e) {
        await sendMessage(
          config.config.discord.channelIds.logs,
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
        config.config.discord.channelIds.logs,
        `Bot is not a member of group ${group.name}`
      );
      continue;
    }
    const enabledCapabilities = Object.keys(
      config.config.vrchat.groupIds[group.id].capabilities
    );
    const requiredPerms = enabledCapabilities
      .map(
        (capability) =>
          CapabilityPermissionRequirements[
            capability as keyof typeof CapabilityPermissionRequirements
          ]
      )
      .flat();
    const missingPermissions = requiredPerms.filter(
      (permission: VRCGroupPermission) =>
        !group.myMember.permissions.includes(permission)
    );
    if (missingPermissions.length > 0) {
      sendMessage(
        config.config.discord.channelIds.logs,
        `Bot is missing permissions in group ${group.name}: ${missingPermissions.join(", ")}`
      );
      continue;
    }
    validGroups.push(group);
  }
  await sendMessage(
    config.config.discord.channelIds.logs,
    `Listening to the following groups:\n${validGroups.map((group) => `- ${group.name}`).join("\n")}`
  );
  setValidGroups(validGroups);
  login();
  setInterval(async () => {
    try {
      const logs = await getNewLogs();
      await sendNewLogs(logs);
    } catch (e) {
      console.error("Error fetching group logs");
      console.error(e);
      try {
        await sendMessage(
          config.config.discord.channelIds.logs,
          "Error fetching group logs"
        );
        if (e instanceof Error) {
          await sendMessage(config.config.discord.channelIds.logs, e.message);
          await sendMessage(
            config.config.discord.channelIds.logs,
            e.stack ?? "no stack provided"
          );
        } else {
          await sendMessage(
            config.config.discord.channelIds.logs,
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
