import { Capabilities } from "capabilities";
import config from "config";
import { GuildMemberRoleManager } from "discord.js";
import VRCGroup from "types/vrcgroup";

export function checkCapability(
  roles: GuildMemberRoleManager,
  group: VRCGroup,
  capability: Capabilities
) {
  const _roleNames =
    config.config.vrchat.groupIds[group.id].capabilities[capability];
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
  return config.config.discord.roleNames[roleName];
};
