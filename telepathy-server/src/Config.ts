import { ConfigBase } from "@devopsplaybook.io/common-utils";
import * as fse from "fs-extra";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { OTelLogger } from "./OTelContext";

const logger = OTelLogger().createModuleLogger("config");

export class Config extends ConfigBase {
  public AGENT_REGISTRATION_DURATION = 30 * 60;
  public TASK_HISTORY_MAX_COUNT = 100;
  public TASK_HISTORY_MAX_AGE_DAYS = 30;
  public TASK_ALIVE_TIMEOUT = 100;
  public FILE_REDUNDANCY = 2;
  public AGENT_KEY: string = uuidv4();
  // Previous configuration key, still accepted so existing deployments keep
  // exporting traces after the upgrade.
  public OPENTELEMETRY_COLLECTOR_HTTP = "";

  constructor() {
    super("telepathy-server", process.env.TELEPATHY_CONFIG || process.env.CONFIG_FILE);

    try {
      const pkg = fse.readJsonSync(path.resolve(__dirname, "../package.json"));
      if (pkg && pkg.version) {
        this.VERSION = pkg.version;
      }
    } catch {
      // Keep the ConfigBase default when running without a package manifest.
    }

    this.addConfigField({ field: "AGENT_REGISTRATION_DURATION" });
    this.addConfigField({ field: "TASK_HISTORY_MAX_COUNT" });
    this.addConfigField({ field: "TASK_HISTORY_MAX_AGE_DAYS" });
    this.addConfigField({ field: "TASK_ALIVE_TIMEOUT" });
    this.addConfigField({ field: "FILE_REDUNDANCY" });
    this.addConfigField({ field: "AGENT_KEY", sensitive: true });
    this.addConfigField({ field: "OPENTELEMETRY_COLLECTOR_HTTP" });
  }

  public async reload(): Promise<void> {
    await super.reload((message: string) => logger.info(message));
    if (!this.OPENTELEMETRY_COLLECTOR_HTTP_TRACES && this.OPENTELEMETRY_COLLECTOR_HTTP) {
      this.OPENTELEMETRY_COLLECTOR_HTTP_TRACES = this.OPENTELEMETRY_COLLECTOR_HTTP;
    }
  }
}
