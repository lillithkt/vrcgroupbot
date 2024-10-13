import { Client, GatewayIntentBits } from "discord.js";
import yargs from "yargs-parser";
import { commands } from "./commands";
import { sendMessage } from "./rest";
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

bot.on("ready", () => {
  console.log(`Logged in as ${bot.user!.tag}`);
  try {
    sendMessage(process.env.DISCORD_CHANNEL_ID_LOGS!, "Bot started");
  } catch (e) {
    console.error("Error sending startup message");
    console.error(e);
  }
});

bot.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(process.env.DISCORD_PREFIX!)) return;
  for (const command of commands) {
    for (const name of [command.name, ...command.aliases]) {
      if (
        message.content
          .slice(process.env.DISCORD_PREFIX!.length)
          .startsWith(name)
      ) {
        try {
          if (
            command.ownerOnly &&
            message.author.id !== process.env.DISCORD_OWNER_ID
          ) {
            message.reply("You don't have permission to use this command");
            return;
          }
          const args = yargs(
            message.content.slice(
              name.length + process.env.DISCORD_PREFIX!.length
            )
          );
          await command.run(args, message);
        } catch (e) {
          console.error(e);
          message.reply("An error occurred while executing this command");
        }
      }
    }
  }
});

bot.login(process.env.DISCORD_TOKEN!);
