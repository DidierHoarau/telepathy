import * as fs from "fs-extra";
import * as _ from "lodash";
import { AppContext } from "../appContext";
import { Logger } from "../utils-std-ts/logger";
import { Timeout } from "../utils-std-ts/timeout";

const logger = new Logger("FileDBUtils");

export class FileDBUtils {
  //
  /* eslint-disable @typescript-eslint/no-explicit-any */
  public static async load(collection: string, defaultData: any): Promise<any> {
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
    await FileDBUtils.save(collection, data);
    return data;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public static async save(collection: string, content: any): Promise<void> {
    for (let i = 0; i < Math.max(AppContext.getConfig().FILE_REDUNDANCY, 1); i++) {
      if (i > 0) {
        await Timeout.wait(200);
      }
      await fs.writeJSON(`${AppContext.getConfig().DATA_DIR}/${collection}${i > 0 ? `.${i}` : ""}.json`, content);
    }
  }
}
