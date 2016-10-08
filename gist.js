'use strict';

const FILENAME = 'location.json';
const ERR_NOT_FOUND = 'Not Found';
const USER_AGENT = 'meeDamian';

let me = {
  FILENAME,
  ERR_NOT_FOUND,
  USER_AGENT
};

me.download = function({https}, gist) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.github.com',
      path: `/gists/${gist}`,
      headers: {'User-Agent': USER_AGENT}
    }, res => {
      let body = '';

      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({json: JSON.parse(body), gist}));
    }).on('error', reject);
  });
};

me.process = function({flag, u}, {gist, json: {message, updated_at: at, files}}) {
  if (message && message === ERR_NOT_FOUND) {
    throw new Error(`gist ${ERR_NOT_FOUND}`);
  }

  const locationFile = files[FILENAME];
  if (!locationFile) {
    throw new Error(`required file ${FILENAME} is missing`);
  }

  const json = JSON.parse(locationFile.content);
  const text = [
    flag(json.country),
    json.city || undefined,
    json.phone ? `📱 ${json.phone}` : undefined
  ].filter(u.empty).join(' ');

  return Object.assign(json, {
    at,
    text,
    gist
  });
};

me = require('mee')(module, me, {
  https: require('https'),
  flag: require('country-emoji').flag,

  u: require('./u.js')
});
