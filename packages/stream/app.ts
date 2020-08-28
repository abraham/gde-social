import * as Twit from 'twit';
import { Status, User } from 'twitter-d';
import { publish } from './pubsub';

const config = require('./.runtimeconfig.json').twitter;

const T = new Twit({
  ...config,
  strictSSL: true,
} as Twit.Options); // TODO: remove 'as Twit.Options'

const listParams = {
  slug: 'web-gdes',
  owner_screen_name: 'robertnyman',
  count: 5000,
};

async function getListMembers(client: Twit): Promise<User[]> {
  const t = await client.get('lists/members', listParams);
  return (t.data as { users: User[] }).users;
}

async function run() {
  console.log('Running');
  const users = await getListMembers(T);
  const userIds = users.map((user) => user.id_str);
  console.log(`Got ${userIds.length} list members`);
  // TODO: remove `as any`
  const stream = T.stream('statuses/filter', {
    follow: userIds.join(','),
  } as any);
  console.log('Connected to stream');

  stream.on('tweet', async (tweet: Status) => {
    if (userIds.includes(tweet.user.id_str)) {
      const result = await publish(tweet.id_str);
      console.log(`New tweet: ${tweet.id_str}, status: ${result}`);
    } else {
      console.log(`Ignoring related tweet: ${tweet.id_str}`);
    }
  });
}

run();
