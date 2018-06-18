import * as express from 'express';

import { publish } from './pubsub';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (_request, response) => {
  response.status(200).send('Hello, world!').end();
});

app.get('/publish/:topic', async (request, response) => {
  const topic = request.params.topic.toLowerCase().trim();
  const result = await publish(topic)

  if (result) {
    response.status(200).send('Published').end();
  } else {
    response.status(500).send('Invalid topic').end()
  }
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
