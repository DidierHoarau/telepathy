import { ConfigBase } from "@devopsplaybook.io/common-utils";
import * as fse from "fs-extra";
import * as os from "os";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { OTelLogger } from "./OTelContext";

const logger = OTelLogger().createModuleLogger("config");

export class Config extends ConfigBase {
  public SERVER = "";
  public AGENT_ID: string = os.hostname();
  public HEARTBEAT_CYCLE = 60;
  public TAGS: string[] = [];
  public AGENT_KEY: string = uuidv4();
  public TASK_ALIVE_FREQUENCY = 10;
  public STARTUP_DELAY = 1;
  public AGENT_ENABLE = true;
  // Previous configuration key, still accepted so existing deployments keep
  // exporting traces after the upgrade.
  public OPENTELEMETRY_COLLECTOR_HTTP = "";

  constructor() {
    super("telepathy-agent", process.env.TELEPATHY_CONFIG || process.env.CONFIG_FILE);

    try {
      const pkg = fse.readJsonSync(path.resolve(__dirname, "../package.json"));
      if (pkg && pkg.version) {
        this.VERSION = pkg.version;
      }
    } catch {
      // Keep the ConfigBase default when running without a package manifest.
    }

    this.addConfigField({ field: "SERVER" });
    this.addConfigField({ field: "AGENT_ID" });
    this.addConfigField({ field: "HEARTBEAT_CYCLE" });
    this.addConfigField({ field: "TAGS" });
    this.addConfigField({ field: "AGENT_KEY", sensitive: true });
    this.addConfigField({ field: "TASK_ALIVE_FREQUENCY" });
    this.addConfigField({ field: "STARTUP_DELAY" });
    this.addConfigField({ field: "AGENT_ENABLE" });
    this.addConfigField({ field: "OPENTELEMETRY_COLLECTOR_HTTP" });
  }

  public async reload(): Promise<void> {
    await super.reload((message: string) => logger.info(message));
    if (!this.OPENTELEMETRY_COLLECTOR_HTTP_TRACES && this.OPENTELEMETRY_COLLECTOR_HTTP) {
      this.OPENTELEMETRY_COLLECTOR_HTTP_TRACES = this.OPENTELEMETRY_COLLECTOR_HTTP;
    }
  }
}
