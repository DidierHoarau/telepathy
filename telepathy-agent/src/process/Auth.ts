import { SpanStatusCode } from "@opentelemetry/api";
import { Span } from "@opentelemetry/sdk-trace-base";
import axios from "axios";
import { Config } from "../Config";
import { Logger } from "../utils-std-ts/Logger";
import { StandardTracer } from "../utils-std-ts/StandardTracer";
import { Timeout } from "../utils-std-ts/Timeout";

const logger = new Logger("agents/auth");

let token = "";
let config: Config;

export class Auth {
  //
  public static init(configIn: Config) {
    config = configIn;
  }

  //
  public static async check(): Promise<void> {
    const span = StandardTracer.startSpan("Auth_check");
    await axios
      .post(
        `${config.SERVER}/agents/${config.AGENT_ID}/session`,
        {
          key: config.AGENT_KEY,
          tags: config.TAGS,
        },
        { headers: StandardTracer.appendHeader(span) }
      )
      .then(async (res) => {
        token = res.data.token;
        span.status.code = SpanStatusCode.OK;
      })
      .catch((error) => {
        span.status.code = SpanStatusCode.ERROR;
        span.recordException(error);
        logger.error(`Error authenticating to server: ${error}`);
      });
    span.end();
    await Timeout.wait(config.HEARTBEAT_CYCLE * 1000);
    Auth.check();
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
  public static async getAuthHeader(context: Span): Promise<any> {
    if (token) {
      return {
        headers: StandardTracer.appendHeader(context, {
          Authorization: `Bearer ${token}`,
        }),
      };
    } else {
      return {};
    }
  }
}
