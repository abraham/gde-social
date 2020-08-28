import * as admin from 'firebase-admin';

import { TwitterClient } from '../functions/src/twitter';
import { buildStatus } from '../functions/src/status';

const config = require('../.runtimeconfig.json').twitter;

admin.initializeApp();

const db = admin.firestore();
const twitter = TwitterClient(config);

async function crawl() {
  let counted = 0;
  let request = 0;

  const users = await twitter.getListMembers(5000);
  console.log(`Getting tweets from ${users.length} users`);

  for (const user of users) {
    let next = true;
    let lastId: string | undefined;
    while (next) {
      request++;
      const tweets = await twitter.getUserTweets(user.screen_name, 200, lastId);
      console.log(
        `Getting ${tweets.length} tweets from ${
          user.screen_name
        } [index: ${users.indexOf(user)}, request: ${request}]`,
      );

      const batch = db.batch();
      for (const tweet of tweets) {
        counted++;
        const doc = db.collection('statuses').doc(tweet.id_str);
        batch.set(doc, buildStatus(tweet));
      }
      await batch.commit();

      if (tweets.length <= 1) {
        next = false;
      } else {
        lastId = tweets[tweets.length - 1].id_str;
      }
    }
  }

  console.log(`Got ${counted} tweets give or take`);
}

crawl();
