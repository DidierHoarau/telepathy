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

let tracerInstance;

export class StandardTracer {
  //
  public static initTelemetry() {
    const provider = new NodeTracerProvider({
      idGenerator: new AWSXRayIdGenerator(),
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: `${AppContext.getConfig().SERVICE_ID}`,
        [SemanticResourceAttributes.SERVICE_VERSION]: `${AppContext.getConfig().VERSION}`,
        [SemanticResourceAttributes.SERVICE_NAMESPACE]: "telepathy",
        [SemanticResourceAttributes.HOST_NAME]: os.hostname(),
      }),
    });
    provider.register();
    if (AppContext.getConfig().OPENTELEMETRY_COLLECTOR_HTTP) {
      const exporter = new OTLPTraceExporter({
        url: AppContext.getConfig().OPENTELEMETRY_COLLECTOR_HTTP,
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
    if (parentContext) {
      span = tracer.startSpan(
        name,
        undefined,
        opentelemetry.trace.setSpan(opentelemetry.context.active(), parentContext)
      ) as Span;
    } else {
      span = tracer.startSpan(`${AppContext.getConfig().SERVICE_ID}-${AppContext.getConfig().VERSION}-${name}`) as Span;
      span.setAttribute(
        SemanticAttributes.HTTP_URL,
        `${AppContext.getConfig().SERVICE_ID}-${AppContext.getConfig().VERSION}-${name}`
      );
    }
    return span;
  }

  public static getTracer(): any {
    if (!tracerInstance) {
      tracerInstance = opentelemetry.trace.getTracer(
        `${AppContext.getConfig().SERVICE_ID}-${AppContext.getConfig().VERSION}`
      );
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
