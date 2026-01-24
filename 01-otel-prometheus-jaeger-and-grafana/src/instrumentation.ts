import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { HostMetrics } from '@opentelemetry/host-metrics';
import { metrics } from '@opentelemetry/api';

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'dice-server',
    [ATTR_SERVICE_VERSION]: '1.0.0',
  })
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    //url: '<your-otlp-endpoint>/v1/metrics', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
    headers: {},
  }),
  exportIntervalMillis: 10000,
});

const sdk = new NodeSDK({
  resource,
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    //url: '<your-otlp-endpoint>/v1/traces',
    headers: {},
  }),
  metricReader: metricReader,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

const meter = metrics.getMeterProvider();

const hostMetrics = new HostMetrics({
  meterProvider: meter,
  name: 'host-metrics'
});

hostMetrics.start();