'use strict';

let me = {};

me.getPipes = function({db}) {
  return db.any('SELECT gist, twitter_token AS token, twitter_secret AS secret FROM pipes');
};

me.getLastHash = function({db}, gist) {
  return db.oneOrNone('SELECT * FROM update WHERE gist = $1 ORDER BY at DESC LIMIT 1', [gist]);
};

me = require('mee')(module, me, {
  db: require('pg-promise')()(process.env.DATABASE_URL)
});
