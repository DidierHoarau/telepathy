import { SpanStatusCode } from "@opentelemetry/api";
import { Span } from "@opentelemetry/sdk-trace-base";
import axios from "axios";
import { AppContext } from "../appContext";
import { Logger } from "../utils-std-ts/logger";
import { StandardTracer } from "../utils-std-ts/standardTracer";
import { Timeout } from "../utils-std-ts/timeout";

const logger = new Logger("agents/auth");

let token = "";

export class Auth {
  //
  public static async check(): Promise<void> {
    const span = StandardTracer.startSpan("Auth_check");
    await axios
      .post(
        `${AppContext.getConfig().SERVER}/agents/${AppContext.getConfig().AGENT_ID}/session`,
        {
          key: AppContext.getConfig().AGENT_KEY,
          tags: AppContext.getConfig().TAGS,
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
    await Timeout.wait(AppContext.getConfig().HEARTBEAT_CYCLE * 1000);
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
