import { FastifyInstance } from "fastify";
import { BatchSpanProcessor, Span } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { AWSXRayIdGenerator } from "@opentelemetry/id-generator-aws-xray";

import { SemanticAttributes, SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import opentelemetry, { SpanStatusCode } from "@opentelemetry/api";
import * as os from "os";
import { AppContext } from "../appContext";
import { Config } from "../config";

let tracerInstance;
let config: Config;

export class StandardTracer {
  //
  public static initTelemetry(initConfig: Config) {
    config = initConfig;
    const provider = new NodeTracerProvider({
      idGenerator: new AWSXRayIdGenerator(),
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: `${config.SERVICE_ID}`,
        [SemanticResourceAttributes.SERVICE_VERSION]: `${config.VERSION}`,
        [SemanticResourceAttributes.SERVICE_NAMESPACE]: "telepathy",
        [SemanticResourceAttributes.HOST_NAME]: os.hostname(),
      }),
    });
    provider.register();
    if (config.OPENTELEMETRY_COLLECTOR_HTTP) {
      const exporter = new OTLPTraceExporter({
        url: config.OPENTELEMETRY_COLLECTOR_HTTP,
        headers: {},
      });
      provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    }
  }

  public static getSpanFromRequest(req: any): Span {
    return (req as any).tracerSpanApi as Span;
  }

  public static startSpan(name, parentContext?: Span): Span {
    const tracer = StandardTracer.getTracer();
    let span;
    let spanName = name;
    if (config.OPENTELEMETRY_COLLECTOR_AWS) {
      spanName = `${config.SERVICE_ID}-${config.VERSION}`;
    }
    if (parentContext) {
      span = tracer.startSpan(
        spanName,
        undefined,
        opentelemetry.trace.setSpan(opentelemetry.context.active(), parentContext)
      ) as Span;
    } else {
      span = tracer.startSpan(spanName) as Span;
      if (config.OPENTELEMETRY_COLLECTOR_AWS) {
        span.setAttribute(SemanticAttributes.HTTP_URL, `${config.SERVICE_ID}-${config.VERSION}-${name}`);
      }
    }
    return span;
  }

  public static getTracer(): any {
    if (!tracerInstance) {
      tracerInstance = opentelemetry.trace.getTracer(`${config.SERVICE_ID}-${config.VERSION}`);
    }
    return tracerInstance;
  }

  public static appendHeader(context: Span, headers = {}): any {
    if (!headers) {
      headers = {};
    }
    headers["OTEL_CONTEXT"] = JSON.stringify(context.spanContext());
    return headers;
  }
}
