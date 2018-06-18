import * as Twit from 'twit';

import { StatusData } from 'twitter-status/dist/status';
import { UserData } from 'twitter-user/dist/user';

export type Status = StatusData;
export type User = UserData;

export interface TwitterCredentials {
  key: string;
  secret: string;
}

export interface StatusRef {
  id: string
  updatedAt: Date;
  data: Status;
}

const defaultParams = {
  include_entities: true,
  tweet_mode: 'extended',
}

const listParams = {
  ...defaultParams,
  slug: 'web-gdes',
  owner_screen_name: 'robertnyman',
};

const timelineParams = {
  ...defaultParams,
}

export function TwitterClient(credentials: TwitterCredentials) {
  const client = buildClient(credentials);
  return {
    getListMembers: (count: number) => getListMembers(client, count),
    getListTweets: (count: number, sinceId: string) => getListTweets(client, count, sinceId),
    getUserTweets: (screenName: string, count: number,  maxId?: string) => getUserTweets(client, screenName, count, maxId),
  };
}

export async function getListMembers(client: Twit, count: number): Promise<User[]> {
  // TODO: Remove `as` when https://github.com/DefinitelyTyped/DefinitelyTyped/pull/26622 is merged
  const t = await client.get('lists/members', { ...listParams, count } as Twit.Params);
  return (t.data as { users: User[]}).users;
}

export async function getListTweets(client: Twit, count: number, since_id: string): Promise<Status[]> {
  // TODO: Remove `as` when https://github.com/DefinitelyTyped/DefinitelyTyped/pull/26622 is merged
  const t = await client.get('lists/statuses', { ...listParams, count, since_id } as Twit.Params);
  return t.data as Status[];
}

export async function getUserTweets(client: Twit, screen_name: string, count: number, max_id?: string): Promise<StatusData[]> {
  let options: Twit.Params = { ...timelineParams, screen_name, count };
  if (max_id) {
    options = { ...options, max_id };
  }
  // TODO: Switch to user_id when https://github.com/DefinitelyTyped/DefinitelyTyped/pull/26622 is merged
  const t = await client.get('statuses/user_timeline', options);
  return t.data as StatusData[];
}

function buildClient(credentials: TwitterCredentials): Twit {
  return new Twit({
    consumer_key: credentials.key,
    consumer_secret: credentials.secret,
    app_only_auth: true
  });
}

export function convertDate(date: string): number {
  return new Date(Date.parse(date.replace(/( \+)/, ' UTC$1'))).getTime();
}

export function parseHashtags(status: Status): string[] {
  return status.entities.hashtags.map(hashtag => hashtag.text.toLowerCase());
}
