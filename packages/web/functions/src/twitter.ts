import * as Twit from 'twit';
import { Status, User } from 'twitter-d';
export { Status };

export interface TwitterCredentials {
  consumer_key: string;
  consumer_secret: string;
  access_token: string;
  access_token_secret: string;
}

export interface StatusRef {
  id: string;
  updatedAt: Date;
  data: Status;
}

const defaultParams = {
  include_entities: true,
  tweet_mode: 'extended',
};

const listParams = {
  ...defaultParams,
  slug: 'web-gdes',
  owner_screen_name: 'robertnyman',
};

const timelineParams = {
  ...defaultParams,
};

export function TwitterClient(credentials: TwitterCredentials) {
  const client = buildClient(credentials);
  return {
    getListMembers: (count: number) => getListMembers(client, count),
    getListTweets: (count: number, sinceId: string) =>
      getListTweets(client, count, sinceId),
    getUserTweets: (screenName: string, count: number, maxId?: string) =>
      getUserTweets(client, screenName, count, maxId),
  };
}

export async function getListMembers(
  client: Twit,
  count: number,
): Promise<User[]> {
  const t = await client.get('lists/members', { ...listParams, count });
  return (t.data as { users: User[] }).users;
}

export async function getListTweets(
  client: Twit,
  count: number,
  since_id: string,
): Promise<Status[]> {
  const t = await client.get('lists/statuses', {
    ...listParams,
    count,
    since_id,
  });
  return t.data as Status[];
}

export async function getUserTweets(
  client: Twit,
  screen_name: string,
  count: number,
  max_id?: string,
): Promise<Status[]> {
  const options: Twit.Params = { ...timelineParams, screen_name, count };
  if (max_id) {
    options.max_id = max_id;
  }
  const t = await client.get('statuses/user_timeline', options);
  return t.data as Status[];
}

function buildClient(credentials: TwitterCredentials): Twit {
  return new Twit({
    ...credentials,
    app_only_auth: true,
  });
}

export function convertDate(date: string): number {
  return new Date(Date.parse(date.replace(/( \+)/, ' UTC$1'))).getTime();
}

export function parseHashtags(status: Status): string[] {
  return (status.entities.hashtags || []).map((hashtag) =>
    hashtag.text.toLowerCase(),
  );
}
