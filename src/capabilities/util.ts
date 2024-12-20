import { Capabilities } from "capabilities";
import data from "data";
import { GuildMemberRoleManager } from "discord.js";
import VRCGroup from "types/vrcgroup";

export function checkCapability(
  roles: GuildMemberRoleManager,
  group: VRCGroup,
  capability: Capabilities
) {
  const _roleNames =
    data.config.vrchat.groupIds[group.id].capabilities[capability];
  const roleNames = _roleNames as string[] | undefined;
  if (!roleNames) {
    return false;
  }
  for (const roleName of roleNames) {
    if (roles.cache.has(roleNameToId(roleName))) {
      return true;
    }
  }
  return false;
}

export const roleNameToId = (roleName: string) => {
  return data.config.discord.roleNames[roleName];
};
