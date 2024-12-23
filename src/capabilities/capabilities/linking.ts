import Capability from "capabilities";
import data from "data";
import { GuildMemberRoleManager, MessageCollector, SlashCommandBuilder } from "discord.js";
import SlashCommand from "discord/commands";
import { sendMessage } from "discord/rest";
import VRCUser from "types/vrcuser";
import { vrcClient } from "vrchat";

enum LinkingState {
    AwaitingLink,
    AwaitingCode,
    Done,
}
const linkingCap = new Capability([
    new SlashCommand(
        () =>
            new SlashCommandBuilder()
                .setName("link")
                .setDescription("Link your VRChat account to your Discord account"),
        async (interaction) => {
            if (!interaction.channel) {
                await interaction.reply("An internal error occured (no channel)");
                return;
            }
            if (await data.getLinkedVrchat(interaction.user.id) !== undefined) {
                await interaction.reply("You are already linked");
                return;
            }
            await interaction.reply("Please send the link to your VRChat Profile");
            const collector = new MessageCollector(interaction.channel, {
                filter: (msg) => msg.author.id === interaction.user.id,
                time: 1000 * 60 * 5,
            });
            let state = LinkingState.AwaitingLink;
            let userId: string | undefined;
            let code: string | undefined;
            collector.on("collect", async (msg) => {
                switch (state) {
                    case LinkingState.AwaitingLink:
                        if (!msg.content.startsWith("https://vrchat.com/home/user/") && !msg.content.startsWith("usr_")) {
                            await interaction.followUp("Invalid link");
                            collector.stop();
                            return;
                        }
                        userId = msg.content.split("/").pop() ?? msg.content;
                        code = Math.random().toString(36).substring(2, 8);
                        await interaction.followUp(`Please set your VRChat status to \`${code}\` and send "done"`);
                        state = LinkingState.AwaitingCode;
                        break;
                    case LinkingState.AwaitingCode:
                        if (msg.content.toLowerCase() !== "done") {
                            await interaction.followUp("Invalid response");
                            collector.stop();
                            return;
                        }
                        if (!userId) {
                            await interaction.followUp("An internal error occured (no userId)");
                            collector.stop();
                            return;
                        }
                        if (!code) {
                            await interaction.followUp("An internal error occured (no code)");
                            collector.stop();
                            return;
                        }
                        const userRes = await vrcClient.get("users/" + userId);
                        const user = userRes.data as VRCUser;
                        if (user.statusDescription !== code) {
                            await interaction.followUp("Invalid code, please run /link again");
                            collector.stop();
                            return;
                        }
                        let rolesGiven: string[] = [];
                        await data.linkUser(interaction.user.id, userId);
                        if (interaction.member?.roles instanceof GuildMemberRoleManager) {
                            await interaction.member.roles.add(data.config.linking!.roles.linked)
                                .then(() => rolesGiven.push("linked"))
                                .catch(console.error);
                            if (data.config.linking!.roles.over18 && user.ageVerificationStatus === "18+") {
                                await interaction.member.roles.add(data.config.linking!.roles.over18)
                                    .then(() => rolesGiven.push("18+"))
                                    .catch(console.error);
                            }
                        }
                        await interaction.followUp("Linked to " + user.displayName);
                        await sendMessage(data.config.discord.channelIds.logs, `<@${interaction.user.id}> linked to ${user.displayName} (${userId}) with roles ${rolesGiven.join(", ")}`);
                        state = LinkingState.Done;
                        collector.stop();
                        break;
                }
            });
        }),
    new SlashCommand(
        () =>
            new SlashCommandBuilder()
                .setName("unlink")
                .setDescription("Unlink your VRChat account from your Discord account"),
        async (interaction) => {
            if (await data.getLinkedVrchat(interaction.user.id) === undefined) {
                await interaction.reply("You are not linked");
                return;
            }
            await data.unlinkUser(interaction.user.id);
            if (interaction.member?.roles instanceof GuildMemberRoleManager) {
                await interaction.member.roles.remove(data.config.linking!.roles.linked)
                    .catch(console.error);
                if (data.config.linking!.roles.over18) {
                    await interaction.member.roles.remove(data.config.linking!.roles.over18)
                        .catch(console.error);
                }
            }
            await sendMessage(data.config.discord.channelIds.logs, `<@${interaction.user.id}> unlinked`);
            await interaction.reply("Unlinked");
        }),
]);

export default data.config.linking ? linkingCap : new Capability([]);