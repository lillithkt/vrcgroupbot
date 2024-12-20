import config, { reloadConfig } from "config";
import { SlashCommandBuilder, TextBasedChannel } from "discord.js";
import { bot } from "discord/bot";
import SlashCommand from "discord/commands";
import { sendMessage } from "discord/rest";
import { shutdown } from "hooks";
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
        .setName("shutdown")
        .setDescription("[Owner Only] Shut down the bot"),
    async (interaction) => {
      reloadConfig();
      await interaction.reply("Shutting down");
      await shutdown();
    },
    undefined,
    true
  ),
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
      const logMessageApi = await sendMessage(config.config.discord.channelIds.logs, {
        content: `Ephemeral Eval by ${interaction.user.username}\ncode: \`${interaction.options.get("code")?.value as string}\``,
      })
      const logMessageChannel = await bot.channels.fetch(config.config.discord.channelIds.logs) as TextBasedChannel;
      const logMessage = await logMessageChannel.messages.fetch(logMessageApi.id);
      try {
        bot && vrcClient;
        const result = await eval(
          `(async () => {${interaction.options.get("code")?.value as string}})()`
        );
        if (!result) {
          await interaction.editReply("No result");
          await logMessage.edit({
            content: logMessage.content + "\nNo result",
          });
          return;
        }
        await interaction.editReply(result.toString());
        await logMessage.edit({
          content: logMessage.content + `\nResult: \`${result.toString()}\``,
        });
      } catch (e) {
        console.error(e);
        await interaction.editReply((e as Error).toString());
        await logMessage.edit({
          content: logMessage.content + `\nError: \`${(e as Error).toString()}\``,
        });
      }
    },
    undefined,
    true
  ),
]);
