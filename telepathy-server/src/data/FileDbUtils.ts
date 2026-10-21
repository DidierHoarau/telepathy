import type { Span } from "@opentelemetry/sdk-trace-base";
import * as fs from "fs-extra";
import { Config } from "../Config";
import { OTelLogger, OTelTracer } from "../OTelContext";
import { TimeoutWait } from "../utils-std-ts/Timeout";

const logger = OTelLogger().createModuleLogger("FileDBUtils");
let config: Config;

export class FileDBUtils {
  //
  public static init(configIn: Config) {
    config = configIn;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public static async load(context: Span, collection: string, defaultData: any): Promise<any> {
    const span = OTelTracer().startSpan("FileDBUtils_load", context);
    let data = defaultData;
    for (let i = 0; i < Math.max(config.FILE_REDUNDANCY, 1); i++) {
      const filename = `${config.DATA_DIR}/${collection}${i > 0 ? `.${i}` : ""}.json`;
      if (fs.existsSync(filename)) {
        try {
          data = await fs.readJSON(filename);
          break;
        } catch (err) {
          logger.error(`Can't load file: ${err}`);
        }
      }
    }
    await FileDBUtils.save(span, collection, data);
    span.end();
    return data;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public static async save(context: Span, collection: string, content: any): Promise<void> {
    for (let i = 0; i < Math.max(config.FILE_REDUNDANCY, 1); i++) {
      if (i > 0) {
        await TimeoutWait(200);
      }
      await fs.writeJSON(`${config.DATA_DIR}/${collection}${i > 0 ? `.${i}` : ""}.json`, content);
    }
  }
}
