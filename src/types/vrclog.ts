export default interface VRCLog {
  actorDisplayName: string;
  actorId: string;
  created_at: string;
  data: unknown;
  description: string;
  eventType: LogEvent;
  groupId: string;
  id: string;
  targetId: string | null;
}

export enum LogEvent {
  MemberLeave = "group.member.leave",
  MemberJoin = "group.member.join",
  RequestJoin = "group.request.create",
  RequestReject = "group.request.reject",
  InstanceKick = "group.instance.kick",
  InstanceWarn = "group.instance.warn",
  Ban = "group.user.ban",
  InstanceClose = "group.instance.close",
  InstanceCreate = "group.instance.create",
  InviteCreate = "group.invite.create",
  InviteCancel = "group.invite.cancel",
  MemberRemove = "group.member.remove",
  MemberRoleAssign = "group.member.role.assign",
  MemberRoleUnassign = "group.member.role.unassign",
  PostCreate = "group.post.create",
  PostDelete = "group.post.delete",
  RoleCreate = "group.role.create",
  RoleUpdate = "group.role.update",
  GroupUpdate = "group.update",
  MemberUserUpdate = "group.member.user.update",
  Unban = "group.user.unban",
  GroupTransferStart = "group.transfer.start",
  GroupTransferAccept = "group.transfer.accept",
}

export const LogEventReadable: Record<LogEvent, string> = {
  [LogEvent.MemberLeave]: "Member Leave",
  [LogEvent.MemberJoin]: "Member Join",
  [LogEvent.RequestJoin]: "Request To Join",
  [LogEvent.RequestReject]: "Request Reject",
  [LogEvent.InstanceKick]: "Instance Kick",
  [LogEvent.InstanceWarn]: "Instance Warn",
  [LogEvent.Ban]: "Ban",
  [LogEvent.InstanceClose]: "Instance Close",
  [LogEvent.InstanceCreate]: "Instance Create",
  [LogEvent.InviteCreate]: "Invite Create",
  [LogEvent.InviteCancel]: "Invite Cancel",
  [LogEvent.MemberRemove]: "Member Remove",
  [LogEvent.MemberRoleAssign]: "Member Role Assign",
  [LogEvent.MemberRoleUnassign]: "Member Role Unassign",
  [LogEvent.PostCreate]: "Post Create",
  [LogEvent.PostDelete]: "Post Delete",
  [LogEvent.RoleCreate]: "Role Create",
  [LogEvent.RoleUpdate]: "Role Update",
  [LogEvent.GroupUpdate]: "Group Update",
  [LogEvent.Unban]: "Unban",
  [LogEvent.MemberUserUpdate]: "User Update",
  [LogEvent.GroupTransferStart]: "Group Transfer Start",
  [LogEvent.GroupTransferAccept]: "Group Transfer Accept",
};

export const LogEventColors: Record<LogEvent, number> = {
  [LogEvent.MemberLeave]: 0xff0000,
  [LogEvent.MemberJoin]: 0x00ff00,
  [LogEvent.RequestJoin]: 0x00ff00,
  [LogEvent.InstanceKick]: 0xff0000,
  [LogEvent.InstanceWarn]: 0xffff00,
  [LogEvent.Ban]: 0xff0000,
  [LogEvent.InstanceClose]: 0xff0000,
  [LogEvent.InstanceCreate]: 0x00ff00,
  [LogEvent.InviteCreate]: 0x00ff00,
  [LogEvent.InviteCancel]: 0xff0000,
  [LogEvent.MemberRemove]: 0xff0000,
  [LogEvent.MemberRoleAssign]: 0x00ff00,
  [LogEvent.MemberRoleUnassign]: 0xff0000,
  [LogEvent.PostCreate]: 0x00ff00,
  [LogEvent.PostDelete]: 0xff0000,
  [LogEvent.RoleCreate]: 0x00ff00,
  [LogEvent.RoleUpdate]: 0x00ff00,
  [LogEvent.GroupUpdate]: 0x00ff00,
  [LogEvent.Unban]: 0x00ff00,
  [LogEvent.MemberUserUpdate]: 0x00ff00,
  [LogEvent.RequestReject]: 0xff0000,
  [LogEvent.GroupTransferStart]: 0x00ff00,
  [LogEvent.GroupTransferAccept]: 0x00ff00,
};
