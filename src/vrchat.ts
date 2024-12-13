import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import config from "config";
import { Secret, TOTP } from "otpauth";
import { CookieJar } from "tough-cookie";
import VRCGroup from "types/vrcgroup";



const jar = new CookieJar();

export const vrcClient = wrapper(
  axios.create({
    jar,
    baseURL: config.config.credentials.vrchat.authproxy ? `${config.config.credentials.vrchat.authproxy}/api/1` : "https://api.vrchat.cloud/api/1",
    headers: {
      "User-Agent": "VRCDiscordBot/1.0.0 (https://github.com/imlvna)",
    },
  })
);
let validGroups: VRCGroup[] = [];
export function setValidGroups(groups: VRCGroup[]) {
  validGroups = groups;
}
export function getValidGroups() {
  return validGroups;
}
let initalized = false;
export async function init() {
  if (initalized) return;
  if (config.config.credentials.vrchat.authproxy) {
    initalized = true;
    return;
  }
  if (!config.config.credentials.vrchat.username || !config.config.credentials.vrchat.password || !config.config.credentials.vrchat.totp) {
    console.error("No VRChat credentials provided");
    return;
  }
  await vrcClient
    .get("/auth/user", {
      headers: {
        Authorization: `Basic ${btoa(`${encodeURIComponent(config.config.credentials.vrchat.username)}:${encodeURIComponent(config.config.credentials.vrchat.password)}`)}`,
      },
    })
    .catch(() => {});
  await vrcClient
    .post("/auth/twofactorauth/totp/verify", {
      code: (new TOTP({
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: Secret.fromBase32(
          config.config.credentials.vrchat.totp.replace(/ /g, "")
        ),
      })).generate(),
    })
    .catch(() => {});
  initalized = true;
  console.log("VRChat API initialized");
}
