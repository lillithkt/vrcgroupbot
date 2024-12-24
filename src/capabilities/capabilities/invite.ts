import { AxiosError } from "axios";
import { checkCapability } from "capabilities/util";
import data from "data";
import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "discord/commands";
import VRCUser from "types/vrcuser";
import { getValidGroups, vrcClient } from "vrchat";
import Capability, { Capabilities } from "../";

const cap = new Capability([
  new SlashCommand(
    () =>
      new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Invite a user to the group")
        .addStringOption((option) =>
          option
            .setName("user")
            .setDescription("The user to invite")
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption((option) =>
          option
            .setName("group")
            .setDescription("The group to ban the user from")
            .setChoices(
              getValidGroups().map((i) => {
                return {
                  name: i.name,
                  value: i.id,
                };
              })
            )
            .setRequired(true)
        ),
    async (interaction) => {
      const group = getValidGroups().find(
        (i) => i.id === interaction.options.get("group")?.value
      );
      if (!group) {
        return await interaction.reply("Invalid group");
      }
      const roles = interaction.member?.roles;
      if (!roles || roles instanceof Array) {
        return await interaction.reply("Error fetching roles");
      }

      if (!checkCapability(roles, group, Capabilities.Invite)) {
        return await interaction.reply(
          "You do not have permission to invite users to this group"
        );
      }
      const user = interaction.options.get("user")?.value;
      if (!user) {
        return await interaction.reply("Invalid user");
      }
      const userObj = await vrcClient.get(`/users/${user}`);
      if (userObj.status !== 200) {
        return await interaction.reply("Invalid user");
      }
      const userObjData = userObj.data as VRCUser;
      try {
        const res = await vrcClient.post(`/groups/${group.id}/invites`, {
          userId: userObjData.id,
        });
        if (res.status !== 200) {
          return await interaction.reply("Error inviting user: " + res.data);
        }
        return await interaction.reply(
          `User ${userObjData.displayName} invited`
        );
      } catch (e) {
        if (e instanceof AxiosError) {
          return await interaction.reply(
            `Error inviting user: ${e.response?.data.error.message}`
          );
        }
        return await interaction.reply(`Error inviting user`);
      }
    },
    async (interaction) => {
      if (interaction.options.getFocused().startsWith("usr_")) {
        return await interaction.respond([]);
      }
      const searchUserRes = await vrcClient.get(
        `/users?n=25&search=${interaction.options.getFocused()}`
      );
      if (searchUserRes.status !== 200) {
        return await interaction.respond([]);
      }
      const data = searchUserRes.data as VRCUser[];
      return interaction.respond(
        data.map((i) => {
          return {
            name: i.displayName,
            value: i.id,
          };
        })
      );
    }
  ),
]);

export default Object.keys(data.config.vrchat.groupIds).length !== 0 ? cap : new Capability([])