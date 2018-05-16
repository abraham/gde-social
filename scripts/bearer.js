const request = require('request');
const config = require('../functions/.runtimeconfig.json').twitter;
const credentials = Buffer.from(`${config.key}:${config.secret}`).toString('base64');
const url = 'https://api.twitter.com/oauth2/token';

request({
  url: url,
  method:'POST',
  headers: {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  },
  body: 'grant_type=client_credentials'
}, function(err, resp, body) {
  console.log('access_token:');
  console.log(JSON.parse(body).access_token);
});
