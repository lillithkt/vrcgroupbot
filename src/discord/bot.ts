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
  let messageWithoutPrefix: string = message.content;
  if (message.content.startsWith(`<@${bot.user!.id}> `)) {
    messageWithoutPrefix = message.content.slice(`<@${bot.user!.id}> `.length);
  }
  if (!messageWithoutPrefix.startsWith(process.env.DISCORD_PREFIX!)) return;
  messageWithoutPrefix = messageWithoutPrefix.slice(
    process.env.DISCORD_PREFIX!.length
  );
  for (const command of commands) {
    for (const name of [command.name, ...command.aliases]) {
      if (messageWithoutPrefix.startsWith(name)) {
        try {
          if (
            command.ownerOnly &&
            message.author.id !== process.env.DISCORD_OWNER_ID
          ) {
            message.reply("You don't have permission to use this command");
            return;
          }
          const args = yargs(messageWithoutPrefix.slice(name.length));
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
