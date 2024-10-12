import { APIMessage, MessageCreateOptions, REST, Routes } from "discord.js";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

export async function sendMessage(
  channelId: string,
  message: MessageCreateOptions | string
): Promise<APIMessage> {
  return (await rest.post(Routes.channelMessages(channelId), {
    body: typeof message === "string" ? { content: message } : message,
  })) as APIMessage;
}
