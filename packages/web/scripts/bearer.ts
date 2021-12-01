import fetch from 'node-fetch';
import { twitter } from '../.runtimeconfig.json';
const credentials = Buffer.from(
  `${twitter.consumer_key}:${twitter.consumer_secret}`,
).toString('base64');
const url = 'https://api.twitter.com/oauth2/token';

interface BearerToken {
  token_type: string;
  access_token: string;
}

async function getBearerToken() {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: 'grant_type=client_credentials',
  });

  const token = (await response.json()) as BearerToken;
  console.log('access_token:');
  console.log(token.access_token);
}

getBearerToken();
