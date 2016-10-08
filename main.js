'use strict';

let me = {};

me.checkIfChanged = function({db, u: {propsEqual}}, fromGist) {
  return db.getLastData(fromGist.gist)
    .then(fromDb => {
      if (propsEqual(fromGist, fromDb, 'country', 'city', 'phone')) {
        return;
      }

      return fromGist;
    })
    .catch(err => {
      throw new Error(`selecting last update for ${fromGist.gist} flopped: ${err.message}`);
    });
}

me.processGist = function({gist: {download, process}, console}, {gist, token, secret}) {
  return download(gist)
    .then(process)

    // check for changes against db
    .then(me.checkIfChanged)

    // attach twitter credentials if changed
    .then(gist => gist ? {gist, twitter: {token, secret}} : undefined)
    .catch(err => {
      console.error(`Error processing ${gist}:`, err.message);
      return undefined;
    });
}

me.cache = function({db, console}, data) {
  return db.putUpdate(data.gist)
    .then(() => data)
    .catch(err => {
      console.error(`Error caching ${data.gist}:`, err.message);
      return;
    });
}

me.tweet = function(_, data) {
  return data;
};

me.main = function({u: {removeEmpty, promisedEach, inspect}, db, process, console}) {
  // get all gist <-> twitter pairs
  db.getPipes()

    // download and process all gists
    .then(promisedEach(me.processGist))

    // eliminate all null entries
    //   null returned when further execution either not possible or not needed
    .then(removeEmpty)

    // cache before tweet, bcoz it's better to skip a tweet, than tweet 1000x
    .then(promisedEach(me.cache))

    .then(inspect(e => JSON.stringify(e, null, 2)))

    // tweet all remaining
    .then(promisedEach(me.tweet))


    .then(console.log)

    // exit cleanly
    .then(() => process.exit(0))
    .catch(err => {
      if (err.message !== 'done') {
        console.error('Error:', err.message);
        process.exit(1);
        return;
      }

      process.exit(0);
  });
}

me = require('mee')(module, me, {
  gist: require('./gist.js'),
  db: require('./db.js'),
  u: require('./u.js'),

  process,
  console
});
