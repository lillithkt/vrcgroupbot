import Command from ".";

export default {
  name: "eval",
  aliases: ["e", "$"],
  ownerOnly: true,
  run: async (args, message) => {
    if (!args._[0]) {
      message.reply("You need to provide code to evaluate");
      return;
    }
    try {
      const result = (0, eval)(args._.join(" "));
      message.reply(result);
    } catch (e) {
      console.error(e);
      message.reply("An error occurred while evaluating this code");
      if (e instanceof Error) {
        message.reply(e.message);
        message.reply(e.stack ?? "no stack provided");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message.reply((e as any).toString());
      }
    }
  },
} as Command;
