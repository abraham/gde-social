import * as exphbs from 'express-handlebars';
import * as express from 'express';
import * as functions from 'firebase-functions';

import { TwitterClient, TwitterCredentials } from './twitter';

const twitter = TwitterClient(functions.config().twitter);
const app = express();

app.engine('handlebars', exphbs({
  defaultLayout: 'index',
  helpers: {
    json: (data: any) => JSON.stringify(data)
  }
}));
app.set('view engine', 'handlebars');

app.get('/', async (request, response) => {
  const tweets = await twitter.getTweets();
  response.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  response.render('index', {
    tweets: tweets,
  });
});

exports.app = functions.https.onRequest(app);
