export default interface VRCUser {
  id: string;
  displayName: string;
  bio: string;
  bioLinks: string[];
  currentAvatarImageUrl: string;
  currentAvatarThumbnailImageUrl: string;
  profilePicOverride: string | null;
  profilePicOverrideThumbnail: string | null;
  status: string;
  userIcon: string | null;
  last_platform: LastPlatform;
}

export enum LastPlatform {
  Windows = "standalonewindows",
  Android = "android",
  IOS = "ios",
}

export const LastPlatformReadable: Record<LastPlatform, string> = {
  [LastPlatform.Windows]: "Windows",
  [LastPlatform.Android]: "Android",
  [LastPlatform.IOS]: "iOS",
};
