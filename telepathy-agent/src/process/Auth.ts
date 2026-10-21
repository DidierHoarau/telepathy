import { SpanStatusCode } from "@opentelemetry/api";
import { StandardTracer } from "@devopsplaybook.io/otel-utils";
import type { Span } from "@opentelemetry/sdk-trace-base";
import axios from "axios";
import { Config } from "../Config";
import { OTelLogger, OTelTracer } from "../OTelContext";
import { TimeoutWait } from "../utils-std-ts/Timeout";

const logger = OTelLogger().createModuleLogger("agents/auth");

let token = "";
let config: Config;

export class Auth {
  //
  public static init(configIn: Config) {
    config = configIn;
  }

  //
  public static async check(): Promise<void> {
    const span = OTelTracer().startSpan("Auth_check");
    await axios
      .post(
        `${config.SERVER}/api/agents/${config.AGENT_ID}/session`,
        {
          key: config.AGENT_KEY,
          tags: config.TAGS,
        },
        { headers: StandardTracer.updateHttpHeader(span) }
      )
      .then(async (res) => {
        token = res.data.token;
        span.status.code = SpanStatusCode.OK;
      })
      .catch((error) => {
        span.status.code = SpanStatusCode.ERROR;
        span.recordException(error);
        logger.error("Error authenticating to server", error as Error);
      });
    span.end();
    await TimeoutWait(config.HEARTBEAT_CYCLE * 1000);
    Auth.check();
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
  public static async getAuthHeader(context: Span): Promise<any> {
    if (token) {
      return {
        headers: StandardTracer.updateHttpHeader(context, {
          Authorization: `Bearer ${token}`,
        }),
      };
    } else {
      return {};
    }
  }
}
