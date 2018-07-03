import * as express from 'express';
import * as exphbs from 'express-handlebars';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { activatedClass as mdcActivatedClass } from './mdc';
import { LIMIT } from './pagination';
import { buildStatus } from './status';
import { Status, TwitterClient } from './twitter';

admin.initializeApp();

const app = express();
const db = admin.firestore();
const twitter = TwitterClient(functions.config().twitter);
const suggestedHashtags = ['angular', 'perfmatters', 'polymer', 'pwa', 'webcomponents'];

app.set('view engine', 'handlebars');
app.engine('handlebars', exphbs({
  defaultLayout: 'index',
  helpers: { mdcActivatedClass }
}));

app.get('/', async (_request, response) => {
  const snaps = await db.collection('statuses')
    .orderBy('createdAt', 'desc')
    .limit(LIMIT).get();
  render(response, snaps, 'index');
});

app.get('/links', async (_request, response) => {
  const snaps = await db.collection('statuses')
    .orderBy('createdAt', 'desc')
    .where('hasLinks', '==', true)
    .limit(LIMIT).get();
  render(response, snaps, 'links');
});

app.get('/hashtag/:hashtag', async (request: express.Request, response: express.Response) => {
  const hashtag = request.params.hashtag.toLowerCase().trim();
  const snaps = await db.collection('statuses')
    .where(`hashtags.${hashtag}`, '>', 0)
    .orderBy(`hashtags.${hashtag}`, 'desc')
    .limit(LIMIT).get();
  render(response, snaps, hashtag);
});

exports.app = functions.https.onRequest(app);
exports.update_statuses = functions.pubsub.topic('fifteen-minute-tick').onPublish(getNewStatuses);
exports.new_status = functions.pubsub.topic('new_status').onPublish(getNewStatuses);

async function getNewStatuses(_message: functions.pubsub.Message, _context: functions.EventContext) {
  const latestId = await latestStatusId();
  const tweets = await twitter.getListTweets(200, latestId);
  console.log(`Got ${tweets.length} tweets`);
  return Promise.all(tweets.map(setStatus))
    .catch(error => console.error(new Error(`ERROR saving all, ${error}`)));
}

function setStatus(tweet: Status) {
  return db.collection('statuses').doc(tweet.id_str).set(buildStatus(tweet))
  .catch(error => console.error(new Error(`ERROR saving ${tweet.id_str}, ${error}`)));
}

function render(response: express.Response, snaps: FirebaseFirestore.QuerySnapshot, routeName: string) {
  const statuses = snaps.docs.map(snap => snap.data());
  const newestCreatedAt = statuses.length > 0 ? statuses[0].createdAt : '0';
  const oldestCreatedAt = statuses.length > 0 ? statuses[statuses.length - 1].createdAt : '';
  response.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  response.render('index', {
    recentHashtags: getHashtags(statuses),
    suggestedHashtags,
    oldestCreatedAt,
    newestCreatedAt,
    routeName,
    statuses,
  });
}

function getHashtags(statuses: FirebaseFirestore.DocumentData[]): string[] {
  const hashtags: string[] = [];
  statuses.forEach(status => {
    Object.keys(status.hashtags).forEach((hashtag: string) => {
      if (!hashtags.includes(hashtag)) {
        hashtags.push(hashtag);
      }
    });
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
