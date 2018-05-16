import * as functions from 'firebase-functions';
import * as Twitter from 'twitter';

import * as express from 'express';
import * as exphbs from 'express-handlebars';

const app = express();
app.engine('handlebars', exphbs({
  defaultLayout: 'index',
  helpers: {
    json: (data) => JSON.stringify(data)
  }
}));
app.set('view engine', 'handlebars');

app.get('/', async (request, response) => {
  const tweets = await getTweets();
  response.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  response.render('index', {
    tweets: tweets,
  });
});

exports.app = functions.https.onRequest(app);

function credentials(): { key: string, secret: string, access_token: string } {
  return functions.config().twitter;
}

function getTweets(): Promise<any> {
  const params = {
    slug: 'web-gdes',
    owner_screen_name: 'robertnyman',
    include_entities: true,
    tweet_mode: 'extended',
    count: 100
  };
  return new Promise((resolve, reject) => {
    client().get('lists/statuses', params, (error, data, response) => {
      if (error) reject(error);
      resolve(data);
    });
  });
}

function client(): Twitter {
  const creds = credentials();
  return new Twitter({
    consumer_key: creds.key,
    consumer_secret: creds.secret,
    bearer_token: creds.access_token
  });
}
