'use strict';

let me = {};

me.checkIfChanged = function({db}, data) {
  return db.getLastData(data.gist)
    .then(hash => {


      if (hash === data.hash) {
        throw new Error('No change');
      }

      return data;
    })
    .catch(err => {
      throw new Error(`selecting last update for ${data.gist} flopped: ${err.message}`);
    });
}

me.processGist = function({gist: {download, process}, console}, {gist, token, secret}) {
  return download(gist)
    .then(process)
    .then(me.checkIfChanged)
    .then(gist => ({gist, twitter: {token, secret}}))
    .catch(err => {
      console.error(`Error processing ${gist}:`, err.message);
      return undefined;
    });
}

function cache(data) {
  return data;
}

me.tweet = function(data) {
  return data;
};

me.main = function({u: {removeEmpty, promisedEach}, db, process, console}) {
  // get all gist <-> twitter pairs
  db.getPipes()

    // download ad process all gists
    .then(promisedEach(me.processGist))

    // eliminate all null entries
    //   null returned when further execution not possible or not needed
    .then(removeEmpty)

    .then(cache)

    // tweet all remaining
    .then(promisedEach(me.tweet))

    .then(e => JSON.stringify(e, null, 2))

    .then(console.log)

    // exit cleanly
    .then(() => process.exit(0))

    // this shouldn't happen
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
  });
}

me = require('mee')(module, me, {
  gist: require('./gist.js'),
  db: require('./db.js'),
  u: require('./u.js'),

  process,
  console
});
