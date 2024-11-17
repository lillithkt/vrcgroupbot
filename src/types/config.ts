import { Capabilities } from "capabilities";
import { ChannelLabel } from "channels";

export default interface iConfig {
  $schema: string;
  credentials: {
    vrchat: {
      username: string;
      password: string;
      totp: string;
    };
    discord: {
      token: string;
      applicationId: string;
    };
  };
  vrchat: {
    groupIds: Record<
      string,
      {
        groupName: string | undefined;
        capabilities: {
          [key in Capabilities]?: string[];
        };
      }
    >;
  };
  discord: {
    ownerIds: string[];
    roleNames: Record<string, string>;
    prefix: string;
    channelIds: Record<ChannelLabel, string>;
  };
}
