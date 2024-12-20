import { capabilities } from "capabilities/list";
import data from "data";
import { Client, GatewayIntentBits, InteractionType, Routes } from "discord.js";
import { rest, sendMessage } from "./rest";
export const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

bot.on("ready", async () => {
  console.log(`Logged in as ${bot.user!.tag}`);
  try {
    sendMessage(data.config.discord.channelIds.logs, "Bot started");
  } catch (e) {
    console.error("Error sending startup message");
    console.error(e);
  }

  const appCommandsRes = await rest.put(
    Routes.applicationCommands(data.config.credentials.discord.applicationId),
    {
      body: capabilities.flatMap((cap) =>
        cap.commands.map((i) => i.builder.toJSON())
      ),
    }
  );
  if (appCommandsRes instanceof Array) {
    console.log("Commands registered");
  }
});

bot.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() && !interaction.isAutocomplete()) return;
  for (const cap of capabilities) {
    const command = cap.commands.find(
      (i) => i.builder.name === interaction.commandName
    );
    if (command) {
      try {
        switch (interaction.type) {
          case InteractionType.ApplicationCommand:
            if (
              command.ownerOnly &&
              !data.config.discord.ownerIds.includes(interaction.user.id)
            ) {
              await interaction.reply(
                "You do not have permission to run this command"
              );
              return;
            }
            await command.run(interaction);
            break;
          case InteractionType.ApplicationCommandAutocomplete:
            if (!command.autocomplete) {
              break;
            }
            await command.autocomplete(interaction);
            break;
        }
      } catch (e) {
        console.error(e);
        if (interaction.isCommand()) {
          await (
            interaction.replied ? interaction.editReply : interaction.reply
          )("An error occurred");
        }
      }
      return;
    }
  }
});

export function login() {
  bot.login(data.config.credentials.discord.token);
}
