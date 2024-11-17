import { CapabilityPermissionRequirements } from "capabilities";
import config from "config";
import { login } from "discord/bot";
import VRCGroup, { VRCGroupPermission } from "types/vrcgroup";
import { init, setValidGroups, vrcClient } from "vrchat";
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
        const group = config.config.vrchat.groupIds[i];
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
  console.log("Started");
})();
