/* tracing.js */
const opentelemetry = require("@opentelemetry/sdk-node");
const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

if (process.env["OPENTELEMETRY_COLLECTOR_HTTP"]) {
  const exporter = new OTLPTraceExporter({
    url: process.env["OPENTELEMETRY_COLLECTOR_HTTP"]"http://localhost:4318/v1/traces",
    headers: {},
  });
  
  const sdk = new opentelemetry.NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "telepathy",
    }),
    traceExporter: exporter,
    instrumentations: [],
  });
  
  sdk.start();  
}

