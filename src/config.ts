import { existsSync, readFileSync } from "fs";
import iConfig from "types/config";

class configInit {
  public config!: iConfig;
  public load() {
    if (existsSync("config.json")) {
      this.config = JSON.parse(readFileSync("config.json", "utf8"));
    } else if (existsSync("/config.json")) {
      this.config = JSON.parse(readFileSync("/config.json", "utf8"));
    } else {
      console.error("No configuration file found.");
      process.exit(1);
    }
  }
  public constructor() {
    this.load();
  }
}

const config = new configInit();

export function reloadConfig() {
  config.load();
}
export default config;
