import * as Twit from 'twit';
import { StatusData } from 'twitter-status/dist/status';

export type Status = StatusData;

export interface TwitterCredentials {
  key: string;
  secret: string;
}

export interface StatusRef {
  id: string
  updatedAt: Date;
  data: Status;
}

const listParams = {
  slug: 'web-gdes',
  owner_screen_name: 'robertnyman',
  include_entities: true,
  tweet_mode: 'extended',
};

export function TwitterClient(credentials: TwitterCredentials) {
  const client = buildClient(credentials);
  return {
    getTweets: (count: number) => getTweets(client, count),
  };
}

export async function getTweets(client: Twit, count: number): Promise<Status[]> {
  const t = await client.get('lists/statuses', { ...listParams, count} as Twit.Params); // Twit.Params doesn't recognize owner_screen_name
  return t.data as Status[];
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
