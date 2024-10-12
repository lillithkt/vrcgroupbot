import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { EmbedBuilder } from "discord.js";
import { sendMessage } from "discordBot";
import { config as dotenvConfig } from "dotenv";
import { Secret, TOTP } from "otpauth";
import { CookieJar } from "tough-cookie";
import VRCLog, { LogEventColors, LogEventReadable } from "types/vrclog";
dotenvConfig();

const totp = new TOTP({
  algorithm: "SHA1",
  digits: 6,
  period: 30,
  secret: Secret.fromBase32(process.env.VRCHAT_TOTP_SECRET!.replace(/ /g, "")),
});

const jar = new CookieJar();

const client = wrapper(
  axios.create({
    jar,
    baseURL: "https://vrchat.com/api/1",
    headers: {
      "User-Agent": "SleepCuddlesBot/1.0.0 (https://github.com/imlvna)",
    },
  })
);
let initalized = false;
export async function init() {
  if (initalized) return;
  await client
    .get("/auth/user", {
      headers: {
        Authorization: `Basic ${btoa(`${encodeURIComponent(process.env.VRCHAT_USERNAME!)}:${encodeURIComponent(process.env.VRCHAT_PASSWORD!)}`)}`,
      },
    })
    .catch(() => {});
  await client
    .post("/auth/twofactorauth/totp/verify", {
      code: totp.generate(),
    })
    .catch(() => {});
  initalized = true;
  console.log("VRChat API initialized");
}

let lastFetched = new Date().toISOString();
export async function getNewLogs(): Promise<VRCLog[]> {
  await init();
  const newLogs: {
    results: VRCLog[];
  } = await client
    .get(
      `/groups/${process.env.VRCHAT_GROUP_ID!}/auditLogs?startDate=${lastFetched}`
    )
    .then((res) => res.data)
    .catch((e) => {
      console.error(e);
      console.error(e.response.data);
    });
  lastFetched = new Date().toISOString();
  return newLogs.results.sort((i, a) => {
    return new Date(i.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function sendNewLogs(logs: VRCLog[]) {
  const embeds: EmbedBuilder[] = [];
  for (const log of logs) {
    const embed = new EmbedBuilder()
      .setTitle(LogEventReadable[log.eventType] || log.eventType)
      .setColor(LogEventColors[log.eventType] || 0x000000)
      .setAuthor({
        name: log.actorDisplayName,
      })
      .setDescription(log.description);
    if (log.targetId) {
      embed.setFooter({
        text: `Target: ${log.targetId}`,
      });
    }
    embeds.push(embed);
  }
  if (embeds.length === 0) return;
  await sendMessage(process.env.DISCORD_CHANNEL_ID_LOGS!, {
    embeds,
  });
}
