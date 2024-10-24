import { checkCapability } from "capabilities/util";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import SlashCommand from "discord/commands";
import { VRCGroupMember } from "types/vrcgroup";
import VRCUser, { LastPlatformReadable } from "types/vrcuser";
import { getValidGroups, vrcClient } from "vrchat";
import Capability, { Capabilities } from "../";

export default new Capability([
  new SlashCommand(
    () =>
      new SlashCommandBuilder()
        .setName("searchusers")
        .setDescription("Search for users")
        .addStringOption((option) =>
          option
            .setName("user")
            .setDescription("The user to show")
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption((option) =>
          option
            .setName("group")
            .setDescription("The group to show additional information for")
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
      const roles = interaction.member?.roles;
      if (!roles || roles instanceof Array) {
        return await interaction.reply("Error fetching roles");
      }

      let embedBuilder = new EmbedBuilder();

      let hasManageMembers = false;

      if (group) {
        hasManageMembers = checkCapability(
          roles,
          group,
          Capabilities.ManageMembers
        );
        if (!hasManageMembers) {
          embedBuilder.setFooter({
            text: "You can get extended information by having the Manage Members permission",
          });
        }
      }
      const user = interaction.options.get("user")?.value;
      if (!user) {
        return await interaction.reply("Invalid user");
      }
      await interaction.deferReply();
      const userObj = await vrcClient.get(`/users/${user}`);
      if (userObj.status !== 200) {
        return await interaction.editReply("Invalid user");
      }
      const userObjData = userObj.data as VRCUser;
      embedBuilder = embedBuilder
        .setAuthor({
          name: userObjData.displayName,
          url: `https://vrchat.com/home/user/${userObjData.id}`,
          iconURL: userObjData.userIcon || undefined,
        })
        .setThumbnail(
          userObjData.profilePicOverride || userObjData.currentAvatarImageUrl
        )
        .setTitle(userObjData.displayName)
        .setURL(`https://vrchat.com/home/user/${userObjData.id}`)
        .addFields([
          {
            name: "ID",
            value: userObjData.id,
          },
          {
            name: "Status",
            value: userObjData.status,
          },
          {
            name: "Bio",
            value: userObjData.bio,
          },
          {
            name: "Last Platform",
            value: LastPlatformReadable[userObjData.last_platform],
          },
        ]);

      if (hasManageMembers) {
        for (const group of getValidGroups()) {
          const res = await vrcClient.get(
            `/groups/${group.id}/members/${userObjData.id}`
          );
          if (res.status !== 200) {
            continue;
          }
          const data = res.data as VRCGroupMember;
          if (data.membershipStatus === "member") {
            embedBuilder = embedBuilder.addFields([
              {
                name: `Member of ${group.name}`,
                value:
                  `Roles: ${data.roleIds.map((i) => group.roles.find((a) => i === a.id)?.name || i).join(", ")}\n` +
                  (data.joinedAt
                    ? `Joined: ${new Date(data.joinedAt).toLocaleString()}\n`
                    : "") +
                  (data.isRepresenting ? "Representing\n" : ""),
              },
            ]);
          }
        }
      }
      await interaction.editReply({ embeds: [embedBuilder.toJSON()] });
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
