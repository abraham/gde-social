import * as Twit from 'twit';

export type Status = {};

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
  count: 50
};

export function TwitterClient(credentials: TwitterCredentials) {
  const client = buildClient(credentials);
  return {
    getTweets: () => getTweets(client),
  };
}

export async function getTweets(client: Twit): Promise<Status[]> {
  const t = await client.get('lists/statuses', listParams);
  return t.data as Status[];
}

function buildClient(credentials: TwitterCredentials): Twit {
  return new Twit({
    consumer_key: credentials.key,
    consumer_secret: credentials.secret,
    app_only_auth: true
  });
}
