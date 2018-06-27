import * as express from 'express';
import * as exphbs from 'express-handlebars';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { LIMIT } from './pagination';
import { buildStatus } from './status';
import { Status, TwitterClient } from './twitter';

admin.initializeApp();

const app = express();
const db = admin.firestore();
const twitter = TwitterClient(functions.config().twitter);

app.set('view engine', 'handlebars');
app.engine('handlebars', exphbs({
  defaultLayout: 'index',
  helpers: {
    mdcActivatedClass: (a: string, b: string): string => a === b ? 'mdc-list-item--activated' : '',
  }
}));

app.get('/', async (_request, response) => {
  const snaps = await db.collection('statuses')
    .orderBy('createdAt', 'desc')
    .limit(100).get();
  render(response, snaps, 'index');
});

app.get('/links', async (_request, response) => {
  const snaps = await db.collection('statuses')
    .orderBy(`createdAt`, 'desc')
    .where(`hasLinks`, '==', true)
    .limit(100).get();
  render(response, snaps, 'links');
});

app.get('/hashtag/:hashtag', async (request, response) => {
  const hashtag = request.params.hashtag.toLowerCase().trim();
  const snaps = await db.collection('statuses')
    .where(`hashtags.${hashtag}`, '>', 0)
    .orderBy(`hashtags.${hashtag}`, 'desc')
    .limit(100).get();
  render(response, snaps, hashtag);
});

exports.app = functions.https.onRequest(app);

exports.update_statuses = functions.pubsub.topic('five-minute-tick').onPublish(async (_event) => {
  const latestId = await latestStatusId();
  const tweets = await twitter.getListTweets(200, latestId);
  console.log(`Got ${tweets.length} tweets`);
  return Promise.all(tweets.map(setStatus))
    .catch(error => console.error(new Error(`ERROR saving all, ${error}`)));
});

function setStatus(tweet: Status) {
  return db.collection('statuses').doc(tweet.id_str).set(buildStatus(tweet))
  .catch(error => console.error(new Error(`ERROR saving ${tweet.id_str}, ${error}`)));
}

function render(response: express.Response, snaps: FirebaseFirestore.QuerySnapshot, routeName: string) {
  const statuses = snaps.docs.map(snap => snap.data())
  response.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  response.render('index', {
    statuses: statuses.slice(0, LIMIT),
    hashtags: getHashtags(statuses),
    routeName,
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

async function latestStatusId(): Promise<string> {
  const snaps = await db.collection('statuses').orderBy('createdAt', 'desc').limit(1).get()
  if (snaps.docs.length > 0) {
    return snaps.docs[0].id;
  } else {
    return '1';
  }
}
