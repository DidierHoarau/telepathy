import { StandardMeter, StandardTracer } from "@devopsplaybook.io/otel-utils";
import { watchFile } from "fs-extra";
import { Config } from "./Config";
import { OTelLogger, OTelSetMeter, OTelSetTracer, OTelTracer } from "./OTelContext";
import { Auth } from "./process/Auth";
import { TaskExecutions } from "./process/TaskExecutions";

const logger = OTelLogger().createModuleLogger("app");

logger.info("====== Starting Telepathy Agent ======");

Promise.resolve().then(async () => {
  //
  const config = new Config();
  await config.reload();
  watchFile(config.CONFIG_FILE, () => {
    logger.info(`Config updated: ${config.CONFIG_FILE}`);
    config.reload();
  });

  if (!config.AGENT_ENABLE) {
    logger.info("AGENT_ENABLE set to false. Shutting down");
    process.exit(0);
  }

  OTelSetTracer(new StandardTracer(config));
  OTelSetMeter(new StandardMeter(config));
  OTelLogger().initOTel(config);

  const span = OTelTracer().startSpan("init");

  Auth.init(config);
  TaskExecutions.init(config);

  span.end();

  setTimeout(() => {
    Auth.check();
  }, 100);
  setTimeout(() => {
    TaskExecutions.check();
  }, 1000);
});
