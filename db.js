'use strict';

let me = {};

me.connection = function ({db, process: {env: {DATABASE_URL}}}) {
  return db()(DATABASE_URL);
};

me.get = function (_, hash) {
  return me.connection().oneOrNone(`
    SELECT  hash, country, city, phone, at,

            twitter.username AS twittername,
            twitter.token AS twitter_token,
            twitter.secret AS twitter_secret,

            github.username AS githubname,
            github.token AS github_token,
            github.gist AS gist
    FROM    refs
    LEFT JOIN   data
      USING     (hash)
    LEFT JOIN   twitter
      USING     (twitter_id)
    LEFT JOIN   github
      USING     (github_id)
    WHERE   hash = $1
    ORDER   BY at DESC
    LIMIT   1
  `, [hash]);
};

me.save = function (_, hash, {country, city, phone}) {
  return me.connection().none('INSERT INTO data (hash, country, city, phone) VALUES ($1, $2, $3, $4)', [hash, country, city, phone]);
};

me.newHash = function (_, hash) {
  return me.connection().none('INSERT INTO refs (hash) VALUES ($1)', [hash]);
};

me = require('mee')(module, me, {
  db: require('pg-promise'),

  process
});
