import SlashCommand from "discord/commands";
import { VRCGroupPermission } from "types/vrcgroup";

export enum Capabilities {
  Logs = "logs",
  BanUnbanKick = "banUnbanKick",
  EditGroup = "editGroup",
  ManageRoles = "manageRoles",
  Invite = "invite",
  Announcement = "announcement",
  ManageMembers = "manageMembers",
}

export const CapabilityPermissionRequirements: Record<
  Capabilities,
  VRCGroupPermission[]
> = {
  [Capabilities.Logs]: [VRCGroupPermission.ViewAuditLogs],
  [Capabilities.BanUnbanKick]: [
    VRCGroupPermission.ManageBans,
    VRCGroupPermission.ManageMembers,
    VRCGroupPermission.RemoveMembers,
  ],
  [Capabilities.EditGroup]: [VRCGroupPermission.ManageData],
  [Capabilities.ManageRoles]: [
    VRCGroupPermission.AssignRoles,
    VRCGroupPermission.ManageRoles,
  ],
  [Capabilities.Invite]: [VRCGroupPermission.ManageInvites],
  [Capabilities.Announcement]: [VRCGroupPermission.ManageAnnouncements],
  [Capabilities.ManageMembers]: [VRCGroupPermission.ManageMembers],
};

export default class Capability {
  public commands: SlashCommand[];
  constructor(
    commands: SlashCommand[],
    init: () => Promise<unknown> = async () => {}
  ) {
    this.commands = commands;
    init();
  }
}
