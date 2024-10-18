import VRCUser from "types/vrcuser";
import { getValidGroups, init, vrcClient } from "vrchat";
import Command from "./";

export default {
  name: "ban",
  aliases: [],
  ownerOnly: false,
  run: async (args, message) => {
    // Check if message author has ban members permission
    if (!message.member?.permissions.has("BanMembers")) {
      message.reply("You don't have permission to ban members");
      return;
    }
    const userId = args._[0] as string;
    if (!userId) {
      message.reply("You need to provide a user ID to ban");
      return;
    }
    if (!userId.startsWith("usr_")) {
      message.reply("Invalid user ID");
      return;
    }
    try {
      await init();
      const userRes = await vrcClient.get(`/users/${userId}`);
      const user = userRes.data as VRCUser;
      if (!user?.displayName) {
        message.reply("User not found");
        return;
      }
      const res = await vrcClient.post(`/groups/${getValidGroups()[0]}/bans`, {
        userId,
      });
      if (res.status !== 200) {
        message.reply("An error occurred while banning this user");
        message.reply(res.data);
      } else message.reply(`Banned user ${user.displayName}`);
    } catch (e) {
      console.error(e);
      message.reply("An error occurred while banning this user");
      if (e instanceof Error) {
        message.reply(e.message);
        message.reply(e.stack ?? "no stack provided");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message.reply((e as any).toString());
      }
    }
  },
} as Command;

export const unban = {
  name: "unban",
  aliases: [],
  ownerOnly: false,
  run: async (args, message) => {
    // Check if message author has ban members permission
    if (!message.member?.permissions.has("BanMembers")) {
      message.reply("You don't have permission to ban members");
      return;
    }
    const userId = args._[0] as string;
    if (!userId) {
      message.reply("You need to provide a user ID to ban");
      return;
    }
    if (!userId.startsWith("usr_")) {
      message.reply("Invalid user ID");
      return;
    }
    try {
      await init();
      const userRes = await vrcClient.get(`/users/${userId}`);
      const user = userRes.data as VRCUser;
      if (!user?.displayName) {
        message.reply("User not found");
        return;
      }
      const res = await vrcClient.delete(
        `/groups/${getValidGroups()[0]}/bans/${userId}`
      );
      if (res.status !== 200) {
        message.reply("An error occurred while unbanning this user");
        message.reply(res.data);
      } else message.reply(`Unbanned user ${user.displayName}`);
    } catch (e) {
      console.error(e);
      message.reply("An error occurred while unbanning this user");
      if (e instanceof Error) {
        message.reply(e.message);
        message.reply(e.stack ?? "no stack provided");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message.reply((e as any).toString());
      }
    }
  },
} as Command;
