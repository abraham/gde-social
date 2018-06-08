import * as admin from 'firebase-admin';
import * as exphbs from 'express-handlebars';
import * as express from 'express';
import * as functions from 'firebase-functions';

import { Status, TwitterClient, convertDate, parseHashtags } from './twitter';

admin.initializeApp();

const app = express();
const db = admin.firestore();
const twitter = TwitterClient(functions.config().twitter);

app.set('view engine', 'handlebars');
app.engine('handlebars', exphbs({
  defaultLayout: 'index',
  helpers: {
    json: (data: any) => JSON.stringify(data)
  }
}));

app.get('/', async (request, response) => {
  const snaps = await db.collection('statuses').limit(25).orderBy('createdAt', 'desc').get();
  response.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  response.render('index', {
    tweets: snaps.docs.map(snap => snap.data()),
  });
});

exports.app = functions.https.onRequest(app);

exports.update_statuses = functions.pubsub.topic('five-minute-tick').onPublish(async (event) => {
  const tweets = await twitter.getTweets(200);
  console.log(`Updating ${tweets.length} statuses`);
  return Promise.all(tweets.map(setStatus))
    .catch(error => console.error(new Error(`ERROR saving all, ${error}`)));
});

function setStatus(status: Status) {
  return db.collection('statuses').doc(status.id_str).set({
    data: JSON.stringify(status),
    hashtags: parseHashtags(status),
    updatedAt: Date.now(),
    createdAt: convertDate(status.created_at)
  })
  .catch(error => console.error(new Error(`ERROR saving ${status.id_str}, ${error}`)));
}
