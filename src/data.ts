import { existsSync, readFileSync } from "fs";
import { Database } from "sqlite3";
import iConfig from "types/config";

interface dbLinkedUser {
  discord_id: string;
  vrchat_id: string;
}

class dataInit {
  public config!: iConfig;
  public database!: Database;
  public stateDirectory = "state";
  public load() {
    if (existsSync("state/config.json")) {
      this.config = JSON.parse(readFileSync("state/config.json", "utf8"));
      this.database = new Database("state/database.sqlite");
    } else if (existsSync("/state/config.json")) {
      this.config = JSON.parse(readFileSync("/state/config.json", "utf8"));
      this.database = new Database("/state/database.sqlite");
      this.stateDirectory = "/state";
    } else {
      console.error("No configuration file found.");
      process.exit(1);
    }
  }
  private initDatabase() {
    this.database.run(
      `CREATE TABLE IF NOT EXISTS linkedUsers (
      discord_id TEXT PRIMARY KEY,
      vrchat_id TEXT
    );`
    );
  }
  linkUser(discordId: string, vrchatId: string) {
    this.database.run(
      `INSERT INTO linkedUsers (discord_id, vrchat_id) VALUES (?, ?);`,
      [discordId, vrchatId]
    );
  }
  unlinkUser(discordId: string) {
    try {this.database.run(`DELETE FROM linkedUsers WHERE discord_id = ?;`, [
      discordId,
    ])} catch (e) {console.error(e)}
  }
  getLinkedDiscord(vrchatId: string): Promise<string | undefined> {
    return new Promise((res, rej) => {
      this.database.get(
      `SELECT discord_id FROM linkedUsers WHERE vrchat_id = ?;`,
      [vrchatId],
      (err, row: string) => {
        if (err) {
          console.error(err);
          res(undefined);
        } else { 
          res(row);
        }
      }
    )});
  }
  getLinkedVrchat(discordId: string): Promise<string | undefined> {
    return new Promise((res, rej) => {
      this.database.get(
      `SELECT vrchat_id FROM linkedUsers WHERE discord_id = ?;`,
      [discordId],
      (err, row: string) => {
        if (err) {
          console.error(err);
          res(undefined);
        } else { 
          res(row)
        }
      }
    )});
  }
  public constructor() {
    this.load();
    this.initDatabase();
  }
}

const data = new dataInit();

export function reloadConfig() {
  data.load();
}
export default data;
