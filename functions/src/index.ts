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
app.engine('handlebars', exphbs({ defaultLayout: 'index', }));

app.get('/', async (_request, response) => {
  const snaps = await db.collection('statuses')
    .orderBy('createdAt', 'desc')
    .limit(50).get();
  render(response, snaps);
});


app.get('/hashtag/:hashtag', async (request, response) => {
  const hashtag = request.params.hashtag;
  const snaps = await db.collection('statuses')
    .where(`hashtags.${hashtag}`, '>', 0)
    .orderBy(`hashtags.${hashtag}`, 'desc')
    .limit(50).get();
  render(response, snaps);
});

exports.app = functions.https.onRequest(app);

exports.update_statuses = functions.pubsub.topic('five-minute-tick').onPublish(async (_event) => {
  const tweets = await twitter.getTweets(200);
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

function render(response: express.Response, snaps: FirebaseFirestore.QuerySnapshot) {
  const statuses = snaps.docs.map(snap => snap.data())
  response.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  response.render('index', {
    statuses,
    hashtags: getHashtags(statuses),
  });
}

function getHashtags(statuses: FirebaseFirestore.DocumentData[]): string[] {
  const hashtags: string[] = [];
  statuses.forEach(status => {
    Object.keys(status.hashtags).forEach((hashtag: string) => {
      if (!hashtags.includes(hashtag)) {
        hashtags.push(hashtag);
      }
    })
  });
  return hashtags;
}
