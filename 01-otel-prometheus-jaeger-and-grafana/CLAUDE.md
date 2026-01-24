# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenTelemetry demonstration project showing how to instrument a Node.js/Express application for observability. The app is a dice-rolling service that exports traces to Jaeger and metrics to Prometheus via an OTLP Collector.

## Commands

**Run the application:**
```bash
npx tsx --import ./src/instrumentation.ts src/app.ts
```

**Install dependencies:**
```bash
npm install
```

## Architecture

The telemetry pipeline flows as:
```
Express App → OTLP Collector (localhost:4318) → Jaeger (traces) / Prometheus (metrics)
```

**Key files:**
- `src/instrumentation.ts` - Initializes OpenTelemetry SDK before the app loads. Must be imported via `--import` flag. Configures OTLP exporters and host metrics collection.
- `src/app.ts` - Express server with `/rolldice` and `/rolldices` endpoints
- `src/dice.ts` - Business logic with manual span creation and counter metrics
- `otlp-collector-config.yaml` - OTLP Collector configuration routing data to backends

**Instrumentation pattern:**
- Tracer and meter instances are created per-module using `trace.getTracer()` and `metrics.getMeter()`
- Manual spans wrap function logic using `tracer.startActiveSpan()` with explicit `span.end()` calls
- Counters and histograms record metrics within span callbacks

## Infrastructure

Requires Docker containers on `otel-network`:
- OTLP Collector (ports 4317/4318)
- Jaeger (port 16686 for UI)
- Prometheus (port 9090)
- Grafana optional (port 3000)
