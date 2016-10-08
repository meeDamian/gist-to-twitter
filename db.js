'use strict';

let me = {};

me.getPipes = function({db}) {
  return db.any('SELECT gist, twitter_token AS token, twitter_secret AS secret FROM pipes');
};

me.getLastData = function({db}, gist) {
  return db.oneOrNone('SELECT country, city, phone, at FROM update WHERE gist = $1 ORDER BY at DESC LIMIT 1', [gist])
    .then(d => d ? d : {});
};

me.putUpdate = function({db}, {gist, country, city, phone, at}) {
  return db.none('INSERT INTO update (gist, country, city, phone, at) VALUES ($1, $2, $3, $4, $5)', [gist, country, city, phone, at]);
};

me = require('mee')(module, me, {
  db: require('pg-promise')()(process.env.DATABASE_URL)
});
