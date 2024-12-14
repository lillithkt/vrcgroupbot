import Capability, { Capabilities } from "capabilities";
import config from "config";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import SlashCommand from "discord/commands";
import { sendMessage } from "discord/rest";
import VRCLog, { LogEvent, LogEventColors, LogEventReadable } from "types/vrclog";
import { getValidGroups, vrcClient } from "vrchat";

let lastFetched = new Date().toISOString();
export async function getNewLogs(): Promise<Map<string, VRCLog[]>> {
  return (
    await Promise.all(
      getValidGroups()
        .filter(
          (i) =>
            config.config.vrchat.groupIds[i.id].capabilities[
              Capabilities.Logs
            ] !== undefined
        )
        .map(async (group) => {
          console.log(`Fetching logs for ${group.name}`);
          const newLogs: {
            results: VRCLog[];
          } = await vrcClient
            .get(`/groups/${group.id}/auditLogs?startDate=${lastFetched}`)
            .then((res) => res.data)
            .catch((e) => {
              console.error(e);
              console.error(e.response.data);
            });
          lastFetched = new Date().toISOString();
          return [
            group.id,
            newLogs.results.sort((i, a) => {
              return (
                new Date(i.created_at).getTime() -
                new Date(a.created_at).getTime()
              );
            }),
          ];
        })
    )
  ).reduce((acc, i) => {
    acc.set(i[0] as string, i[1] as VRCLog[]);
    return acc;
  }, new Map<string, VRCLog[]>());
}

export async function sendNewLogs(groups: Map<string, VRCLog[]>) {
  const embeds: EmbedBuilder[] = [];
  for (const group of groups.keys()) {
    for (const log of groups.get(group)!) {
      const embed = new EmbedBuilder()
        .setTitle(LogEventReadable[log.eventType] || log.eventType)
        .setColor(LogEventColors[log.eventType] || 0x000000)
        .setAuthor({
          name: getValidGroups().find((i) => i.id === group)?.name || "Unknown",
        })
        .setDescription(log.description);
      if (log.targetId) {
        embed.setFooter({
          text: `Target: ${log.targetId}\nCreated at: ${log.created_at}`,
        });
      } else {
        embed.setFooter({
          text: `Created at: ${log.created_at}`,
        });
      }
      switch (log.eventType) {
        case LogEvent.PostCreate: {
          embed.addFields([
            {
              name: "Title",
              value: (log.data as any).title,
            },
            {
              name: "Content",
              value: (log.data as any).text,
            },
            {
              name: "Visibility",
              value: (log.data as any).visibility,
            }
          ])
          if ((log.data as any).imageId) {
            const fileInfo = await vrcClient.get(`/file/${(log.data as any).imageId}`).then((res) => res.data);
            const latestVersion = (fileInfo.data as {
              versions: {
                version: number;
              }[]
            }).versions.sort((a, b) => b.version - a.version)[0];
            embed.setThumbnail(`https://api.vrchat.cloud/api/1/file/${(log.data as any).imageId}/${latestVersion.version}`);
          }
        }
      }
      embeds.push(embed);
    }
  }
  if (embeds.length === 0) return;
  // chunk the embeds into 10
  for (let i = 0; i < embeds.length; i += 10) {
    await sendMessage(config.config.discord.channelIds.logs, {
      embeds: embeds.slice(i, i + 10),
    });
  }
}

async function updateLogs() {
  try {
    const logs = await getNewLogs();
    await sendNewLogs(logs);
  } catch (e) {
    console.error("Error fetching group logs");
    console.error(e);
    try {
      await sendMessage(
        config.config.discord.channelIds.logs,
        "Error fetching group logs"
      );
      if (e instanceof Error) {
        await sendMessage(config.config.discord.channelIds.logs, e.message);
        await sendMessage(
          config.config.discord.channelIds.logs,
          e.stack ?? "no stack provided"
        );
      } else {
        await sendMessage(
          config.config.discord.channelIds.logs,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (e as any).toString()
        );
      }
    } catch (e) {
      console.error("Error sending error message");
      console.error(e);
    }
  }
}

export default new Capability(
  [
    new SlashCommand(
      () =>
        new SlashCommandBuilder()
          .setName("fetchlogs")
          .setDescription("Manually fetch logs"),
      async (interaction) => {
        await interaction.deferReply();
        await updateLogs();
        await interaction.editReply("Fetched logs");
      }
    ),
    new SlashCommand(
      () =>
        new SlashCommandBuilder()
          .setName("setlastlogfetch")
          .setDescription(
            "Set the time that logs were last fetched, to backfill"
          )
          .addStringOption((option) =>
            option
              .setName("date")
              .setDescription("The date to set")
              .setRequired(true)
          ),
      async (interaction) => {
        const date = new Date(interaction.options.get("date")?.value as string);
        if (isNaN(date.getTime())) {
          await interaction.reply("Invalid date");
          return;
        }
        lastFetched = date.toISOString();
        await interaction.reply("Set last fetched date to " + lastFetched);
      }
    ),
  ],
  async () => {
    setInterval(updateLogs, 1000 * 60 * 2.5);
  }
);
