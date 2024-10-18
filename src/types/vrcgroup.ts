export default interface VRCGroup {
  id: string;
  name: string;
  membershipStatus: "member" | "inactive";
  myMember: {
    permissions: VRCGroupPermission[];
  };
}
/**       "group-announcement-manage",
      "group-audit-view",
      "group-bans-manage",
      "group-data-manage",
      "group-default-role-manage",
      "group-galleries-manage",
      "group-instance-join",
      "group-instance-manage",
      "group-instance-moderate",
      "group-instance-open-create",
      "group-instance-plus-create",
      "group-instance-plus-portal",
      "group-instance-plus-portal-unlocked",
      "group-instance-public-create",
      "group-instance-queue-priority",
      "group-instance-restricted-create",
      "group-invites-manage",
      "group-members-manage",
      "group-members-remove",
      "group-members-viewall",
      "group-roles-assign",
      "group-roles-manage" */
export enum VRCGroupPermission {
  ManageAnnouncements = "group-announcement-manage",
  ViewAuditLogs = "group-audit-view",
  ManageBans = "group-bans-manage",
  ManageData = "group-data-manage",
  ManageDefaultRole = "group-default-role-manage",
  ManageGalleries = "group-galleries-manage",
  JoinInstance = "group-instance-join",
  ManageInstance = "group-instance-manage",
  ModerateInstance = "group-instance-moderate",
  CreateOpenInstance = "group-instance-open-create",
  CreatePlusInstance = "group-instance-plus-create",
  PortalPlusInstance = "group-instance-plus-portal",
  UnlockedPortalPlusInstance = "group-instance-plus-portal-unlocked",
  CreatePublicInstance = "group-instance-public-create",
  PriorityQueueInstance = "group-instance-queue-priority",
  CreateRestrictedInstance = "group-instance-restricted-create",
  ManageInvites = "group-invites-manage",
  ManageMembers = "group-members-manage",
  RemoveMembers = "group-members-remove",
  ViewAllMembers = "group-members-viewall",
  AssignRoles = "group-roles-assign",
  ManageRoles = "group-roles-manage",
}
