import { AxiosError } from "axios";
import { checkCapability } from "capabilities/util";
import data from "data";
import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "discord/commands";
import { getValidGroups, vrcClient } from "vrchat";
import Capability, { Capabilities } from "../";

const cap = new Capability([
  new SlashCommand(
    () =>
      new SlashCommandBuilder()
        .setName("announcement")
        .setDescription("Create an announcement")
        .addBooleanOption((option) =>
          option
            .setName("sendnotification")
            .setDescription("Whether to send a notification")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("title")
            .setDescription("The title of the announcement")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("The message to send")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("group")
            .setDescription("The group to send the announcement to")
            .setRequired(true)
            .setChoices(
              getValidGroups().map((i) => {
                return {
                  name: i.name,
                  value: i.id,
                };
              })
            )
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

      if (!checkCapability(roles, group, Capabilities.Announcement)) {
        return await interaction.reply(
          "You do not have permission to unban users from this group"
        );
      }
      if (!interaction.options.get("message")) {
        return await interaction.reply("Invalid message");
      }
      if (!interaction.options.get("title")) {
        return await interaction.reply("Invalid title");
      }
      try {
        const res = await vrcClient.post(`/groups/${group.id}/announcement`, {
          text: interaction.options.get("message")?.value,
          title: interaction.options.get("title")?.value,
          sendNotification: interaction.options.get("send notification")?.value,
        });
        if (res.status !== 200) {
          return await interaction.reply("Error sending announcement");
        }
        return await interaction.reply("Announcement sent");
      } catch (e) {
        if (e instanceof AxiosError) {
          return await interaction.reply(
            `Error sending announcement: ${e.response?.data.error.message}`
          );
        }
        return await interaction.reply(`Error sending announcement`);
      }
    }
  ),
]);

export default Object.keys(data.config.vrchat.groupIds).length !== 0 ? cap : new Capability([])