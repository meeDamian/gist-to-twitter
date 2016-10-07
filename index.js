'use strict';

const crypto = require('crypto');
const https = require('https');
const url = require('url');

const flag = require('emoji-flag')
const pg = require('pg-promise')();

const countries = require('./countries.json');

const db = pg(process.env.DATABASE_URL);

const GIST_FILENAME = 'location.json';
const ERR_NOT_FOUND = 'Not Found';

// injects function that allows to preview current state of data
// use as:
//  .then(inspect(value => {
//    // do whatever you want with data
//  }))
function inspect(fn) {
  return v => {
    fn((JSON.parse(JSON.stringify(v))));
    return v;
  }
}

function hash(string) {
  return crypto.createHash('sha256')
    .update(string)
    .digest('hex');
}

function getGist(gistId) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.github.com',
      path: `/gists/${gistId}`,
      headers: {'User-Agent': 'meeDamian'}
    }, res => {
      let body = '';

      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({json: JSON.parse(body), gistId}));
    }).on('error', reject);
  })
}

function processGist({gistId, json: {message, updated_at: at, files}}) {
  if (message && message === ERR_NOT_FOUND) {
    throw new Error(`gist ${ERR_NOT_FOUND}`);
  }

  const locationFile = files[GIST_FILENAME];
  if (!locationFile) {
    throw new Error(`required file ${GIST_FILENAME} is missing`);
  }

  const json = JSON.parse(locationFile.content);
  const text = `${flag('IN')} ${json.city} 📱 ${json.phone}`;

  return Object.assign(json, {
    at,
    text,
    hash: hash(text),
    gistId
  });
}

function checkIfChanged(data) {
  return db.oneOrNone('SELECT hash FROM gist_updates WHERE gist = $1 ORDER BY at DESC LIMIT 1', [data.gistId])
    .then(update => {
      if (update && update.hash === data.hash) {
        throw new Error('No change');
      }

      return data;
    })
    .catch(err => {
      throw new Error(`SELECT last update flopped: ${err.message}`);
    })
}

function processPipe({gist, token, secret}) {
  return getGist(gist)
    .then(processGist)
    .then(checkIfChanged)
    .then(gist => ({gist, twitter: {token, secret}}))
    .catch(err => {
      console.error(`Error processing ${gist}:`, err.message);
      return null;
    });
}

function cache(data) {
  return data;
}

function tweet(data) {
  return data;
}


db.any('SELECT gist, twitter_token AS token, twitter_secret AS secret FROM pipes')

  // download ad process all gists
  .then(data => Promise.all(data.map(processPipe)))

  // eliminate all null entries (null - further execution either not needed or not possible)
  .then(data => data.filter(data => !!data))

  .then(cache)

  // tweet all remaining
  .then(data => Promise.all(data.map(tweet)))


  .then(e => JSON.stringify(e, null, 2))


  .then(console.log)

  // exit cleanly
  .then(() => process.exit(0))

  // this shouldn't happen
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
