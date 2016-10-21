'use strict';

let me = {};

me.handleNoHash = function ({db}, hash) {
  return data => {
    if (!data) {
      return db.newHash(hash)
        .then(() => ({hash}))
        .catch(err => {
          console.error('handleNoHash():', err);
          throw new Error(`Error creating hash(${hash}): ${err.message}`);
        });
    }

    return data;
  };
};

me.handleSave = function ({db, local: {theSame}}, {hash, prev, curr}) {
  if (theSame(prev, curr, true)) {
    return;
  }

  return db.save(hash, curr)
    .then(() => undefined)
    .catch(err => {
      console.error('handleSave():', err);
      return `Can't save to db ${hash}: ${err.message}`;
    });
};

me.save = function ({utils, local: {normalize, reformat}, db, gist, twitter}, {body}, res) {
  if (!body.hash) {
    res.status(401).json({err: `'hash' must be provided`});
    return;
  }

  // produce public & dispose private
  const hash = utils.toPublic(body.hash);
  body.hash = undefined;
  delete body.hash;

  body = normalize(body);

  db.get(hash)
    .then(me.handleNoHash(hash))
    .then(reformat(hash, body))
    .then(data => {
      return Promise.all([
        me.handleSave(data),
        gist.doThings(data),
        twitter.tweet(data)
      ]);
    })
    .then(([db, github, twitter]) => {
      // TODO: improve returned thingy
      res.status(200).json({message: {db, github, twitter}});
      return;
    })
    .catch(err => {
      console.error('save():', err);
      res.status(500).send(err);
      return;
    });
};

me.main = function ({express, process: {env: {PORT = 3000}}, jsonParser}) {
  const app = express();
  app.use(jsonParser);
  app.post('/', me.save);
  app.get('/', (req, res) => res.status(200).send('OK'));
  app.listen(PORT);
};

me = require('mee')(module, me, {
  express: require('express'),
  jsonParser: require('body-parser').json(),

  twitter: require('./twitter'),
  utils: require('./utils'),
  local: require('./local'),
  gist: require('./gist'),
  db: require('./db'),

  process
});
