import * as request from 'request-promise-native';
const config = require('../.runtimeconfig.json').twitter;
const credentials = Buffer.from(`${config.key}:${config.secret}`).toString('base64');
const url = 'https://api.twitter.com/oauth2/token';

interface BearerToken {
  token_type: string;
  access_token: string;
}

async function getBearerToken() {
  const token: BearerToken = await request({
    url: url,
    method:'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: 'grant_type=client_credentials'
  }).then(JSON.parse);

  console.log('access_token:');
  console.log(token.access_token);
}

getBearerToken();
