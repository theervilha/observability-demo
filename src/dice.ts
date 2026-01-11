import { trace, metrics, type Span, ValueType } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib', '0.1.0');
const meter = metrics.getMeter('dice-server', '0.1.0');

// Counter possibitilies: counter / upDownCounter / histogram
const counter = meter.createCounter(
    'dice-lib.rolls.counter',
    // Describing instruments
    {
        description: 'Counts how many times the dice have been rolled',
        unit: 'units',
        valueType: ValueType.INT,
    }
);

/**
 * Also it is possible to use observable counters.
 * Observable (Async) Counters -> Monotonically increasing cumulative value observed at intervals. (e.g., total requests: 100, 150, 200...)
 * Observable (Async) UpDown Counters -> Cumulative value that can go up and down observed at intervals. (e.g., active connections: 10, 8, 12...))
 * Observable (Async) Gauge -> Gauge value observed at intervals. Current instantaneous value (not cumulative) (e.g., CPU usage: 50%, 75%, 30%...)
 */

export function rollOnce(i: number = 0, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    counter.add(1)//, { 'some.optional.attribute': result.toString() });

    // Add key/value to carry more information
    span.setAttribute('dicelib.rolled', result.toString());
    span.end();

    return result
  });
}

export function rollTheDice(rolls: number, min: number, max: number) {
    return tracer.startActiveSpan(
        'rollTheDice',
        { attributes: { 'dicelib.rolls': rolls.toString() } },
        (span: Span) => {
            const result: number[] = [];
            for (let i = 0; i < rolls; i++) {
                result.push(rollOnce(i, min, max));
            }
            span.end();
            return result;      
        }
    )
}


/**
 * Other possibities:
 * Span events: human-readable message on an Span that represents a discrete event with no duration that can be tracked by a single timestamp. Like primitive log
 * span.addEvent('Doing something');
 * span.addEvent('some log', {
    'log.severity': 'error',
    'log.message': 'Data not found',
    'request.id': requestId,
    });

 * Span links
    
 * Span Status
import { SpanStatusCode } from '@opentelemetry/api';
span.setStatus({
    code: SpanStatusCode.ERROR,
    message: 'Error',
});

 * Recording exceptions
It can be a good idea to record exceptions when they happen. It’s recommended to do this in conjunction with setting span status.
try {
  doWork();
} catch (ex) {
  if (ex instanceof Error) {
    span.recordException(ex);
  }
  span.setStatus({ code: SpanStatusCode.ERROR });
}
 */
