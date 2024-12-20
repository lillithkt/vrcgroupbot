import { CapabilityPermissionRequirements } from "capabilities";
import data from "data";
import { login } from "discord/bot";
import VRCGroup, { VRCGroupPermission } from "types/vrcgroup";
import { init, setValidGroups, vrcClient } from "vrchat";
import "./capabilities/list";
import { sendMessage } from "./discord/rest";
import "./hooks";


process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  sendMessage(data.config.discord.channelIds.logs, `Unhandled Rejection at: ${promise} reason: ${reason}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  sendMessage(data.config.discord.channelIds.logs, `Uncaught Exception: ${err}`);
});

(async () => {
  console.log("Starting up");
  await init();

  const groups = await Promise.all(
    Object.keys(data.config.vrchat.groupIds).map(async (i) => {
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
          data.config.discord.channelIds.logs,
          `Error fetching group ${i}`
        );
        const group = data.config.vrchat.groupIds[i];
        console.error(`Error fetching group ${group.groupName ? `${group.groupName} (${i})` : i}`);
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
        data.config.discord.channelIds.logs,
        `Bot is not a member of group ${group.name}`
      );
      continue;
    }
    const enabledCapabilities = Object.keys(
      data.config.vrchat.groupIds[group.id].capabilities
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
        data.config.discord.channelIds.logs,
        `Bot is missing permissions in group ${group.name}: ${missingPermissions.join(", ")}`
      );
      continue;
    }
    validGroups.push(group);
  }
  await sendMessage(
    data.config.discord.channelIds.logs,
    `Listening to the following groups:\n${validGroups.map((group) => `- ${group.name}`).join("\n")}`
  );
  setValidGroups(validGroups);
  login();
  console.log("Started");
})();
