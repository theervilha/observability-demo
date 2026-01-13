# Open Telemetry Demo

You will be able to see traces using Jaeger and metrics using Prometheus. All data is collected using OpenTelemetry. The code send data to the OTLP Collector Server.

## Setting up OTLP Collector Setup

This will be the server that will receive data from your application. In the code (intrumentation.ts), you configure to send telemetry data to the OTLP Collector. And then, your backend storage (like Jaeger / Prometheus) will listen to data coming from this OTLP Server.

Create a file called otlp-collector-config.yaml:
```
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
  debug:
    verbosity: detailed
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true
  otlphttp/prometheus:
    endpoint: "http://prometheus:9090/api/v1/otlp"
    tls:
      insecure: true
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug, otlp/jaeger]
    metrics:
      receivers: [otlp]
      exporters: [debug, otlphttp/prometheus]
    logs:
      receivers: [otlp]
      exporters: [debug]
```


## Running

First, create the network.

`docker network create otel-network`

Now run the OTLP collector in a docker container:

`docker run --network otel-network -p 4317:4317 -p 4318:4318 --rm -v $(pwd)/otlp-collector-config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector`

follow the next steps.

## Setting up with Jaeger

Jaeger supports OTLP to receive trace data. Run it in a docker container with UI on port 16686 and OTLP enabled on ports 4317 and 4318:

It will get data from the OTLP server.

```docker run --name jaeger \
  --network otel-network \
  -e COLLECTOR_OTLP_ENABLED=true \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 16686:16686 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

## Setting up with Prometheus

Create a prometheus.yml with the following content:

```scrape_configs:
  - job_name: dice-service
    scrape_interval: 5s
```

Run in a docker container:

`docker run --rm --name prometheus \
  --network otel-network \
  -v ${PWD}/prometheus.yml:/etc/prometheus/prometheus.yml \
  -p 9090:9090 \
  prom/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --web.enable-otlp-receiver`

## Testing Observability

Run the application:

`npx tsx --import ./src/instrumentation.ts src/app.ts`

Access http://localhost:8080/rolldices?rolls=200

Access Jaeger and see the traces in: http://localhost:16686
Wait 10 seconds and access Prometheus to see the metrics: http://localhost:9090
