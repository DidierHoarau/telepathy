import { Config } from "./config";

let config: Config;

export class AppContext {
  //
  public static setConfig(reference: Config): void {
    config = reference;
  }
  public static getConfig(): Config {
    return config;
  }
}
