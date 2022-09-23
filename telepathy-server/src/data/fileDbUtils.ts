import { Span } from "@opentelemetry/sdk-trace-base";
import * as fs from "fs-extra";
import * as _ from "lodash";
import { AppContext } from "../appContext";
import { StandardTracer } from "../utils-std-ts/standardTracer";
import { Logger } from "../utils-std-ts/logger";
import { Timeout } from "../utils-std-ts/timeout";

const logger = new Logger("FileDBUtils");

export class FileDBUtils {
  //
  /* eslint-disable @typescript-eslint/no-explicit-any */
  public static async load(context: Span, collection: string, defaultData: any): Promise<any> {
    const span = StandardTracer.startSpan("FileDBUtils_load", context);
    let data = defaultData;
    for (let i = 0; i < Math.max(AppContext.getConfig().FILE_REDUNDANCY, 1); i++) {
      const filename = `${AppContext.getConfig().DATA_DIR}/${collection}${i > 0 ? `.${i}` : ""}.json`;
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
    const span = StandardTracer.startSpan("FileDBUtils_save", context);
    for (let i = 0; i < Math.max(AppContext.getConfig().FILE_REDUNDANCY, 1); i++) {
      if (i > 0) {
        await Timeout.wait(200);
      }
      await fs.writeJSON(`${AppContext.getConfig().DATA_DIR}/${collection}${i > 0 ? `.${i}` : ""}.json`, content);
    }
    span.end();
  }
}
