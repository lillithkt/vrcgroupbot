import { reloadConfig } from "config";
import { SlashCommandBuilder } from "discord.js";
import { bot } from "discord/bot";
import SlashCommand from "discord/commands";
import { vrcClient } from "vrchat";
import Capability from "../";

export default new Capability([
  new SlashCommand(
    () =>
      new SlashCommandBuilder()
        .setName("reloadconfig")
        .setDescription("[Owner Only] Reload the configuration"),
    async (interaction) => {
      reloadConfig();
      await interaction.reply("Configuration reloaded");
    },
    undefined,
    true
  ),
  new SlashCommand(
    () =>
      new SlashCommandBuilder()
        .setName("eval")
        .setDescription("[Owner Only] Run Code")
        .addStringOption((option) =>
          option
            .setName("code")
            .setDescription("The code to run")
            .setRequired(true)
        ),
    async (interaction) => {
      await interaction.deferReply();
      try {
        bot && vrcClient;
        const result = await eval(
          `(async () => {${interaction.options.get("code")?.value as string}})()`
        );
        if (!result) {
          await interaction.editReply("No result");
          return;
        }
        await interaction.editReply(result.toString());
      } catch (e) {
        console.error(e);
        await interaction.editReply((e as Error).toString());
      }
    },
    undefined,
    true
  ),
  new SlashCommand(
    () =>
      new SlashCommandBuilder()
        .setName("eeval")
        .setDescription("[Owner Only] Run Code (Ephemeral)")
        .addStringOption((option) =>
          option
            .setName("code")
            .setDescription("The code to run")
            .setRequired(true)
        ),
    async (interaction) => {
      await interaction.deferReply({ ephemeral: true });
      try {
        bot && vrcClient;
        const result = await eval(
          `(async () => {${interaction.options.get("code")?.value as string}})()`
        );
        if (!result) {
          await interaction.editReply("No result");
          return;
        }
        await interaction.editReply(result.toString());
      } catch (e) {
        console.error(e);
        await interaction.editReply((e as Error).toString());
      }
    },
    undefined,
    true
  ),
]);
