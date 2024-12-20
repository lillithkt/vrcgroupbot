import data from "data";
import { APIMessage, MessageCreateOptions, REST, Routes } from "discord.js";
export const rest = new REST({ version: "10" }).setToken(
  data.config.credentials.discord.token
);

export async function sendMessage(
  channelId: string,
  message: MessageCreateOptions | string
): Promise<APIMessage> {
  return (await rest.post(Routes.channelMessages(channelId), {
    body: typeof message === "string" ? { content: message } : message,
  })) as APIMessage;
}
