import express, { Express } from 'express';
import { rollOnce, rollTheDice } from './dice';
import { metrics } from '@opentelemetry/api';

const PORT: number = parseInt(process.env.PORT || '8081');
const app: Express = express();

const meter = metrics.getMeter('dice-server', '0.1.0');

app.get('/rolldice', (req, res) => {
  res.send(rollOnce(0, 1, 6).toString());
});

app.get('/rolldices', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }

  const histogram = meter.createHistogram('rolldices.duration');
  const startTime = new Date().getTime();

  const result = rollTheDice(rolls, 1, 6)
  
  // Record the duration of the task operation
  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;
  histogram.record(executionTime);

  res.send(JSON.stringify(result));

});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
