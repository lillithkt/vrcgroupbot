import { Message } from "discord.js";
import { Arguments } from "yargs-parser";
import ban, { unban } from "./ban";
import eval from "./eval";

export default interface Command {
  name: string;
  aliases: string[];
  ownerOnly: boolean;
  run: (args: Arguments, message: Message) => void;
}

export const commands: Command[] = [eval, ban, unban];
