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
    .then(() => ({id: hash}))
    .catch(err => {
      console.error(err);
      return `Can't save to db ${hash}: ${err.message}`;
    });
};

me.save = function ({utils, local: {normalize, reformat}, db, gist, twitter}, body, res, isPatch = false) {
  if (!body.hash) {
    res.status(401).json({err: `'hash' must be provided`});
    return;
  }

  // produce public & dispose private
  const hash = utils.toPublic(body.hash);
  body.hash = undefined;
  delete body.hash;

  // strip everything we don't care about;
  // add .flag
  body = normalize(body);

  db.get(hash)
    .then(data => {
      if (isPatch && !data) {
        const err = {err: 'Can\'t PATCH something that doesn\'t exist'};
        throw err;
      }

      return data;
    })
    .then(me.handleNoHash(hash))
    .then(reformat(hash, body, isPatch))
    .then(data => {
      // all those promises return either:
      //  * undefined - no error, but action not performed/not necessary
      //  * {id: ''}  - action peformed successfully; resource `id`
      //  * {err: ''} - action not performed due to an error
      return Promise.all([
        me.handleSave(data),
        gist.doThings(data),
        twitter.tweet(data)
      ]);
    })
    .then(([db, github, twitter]) => {
      res.status(200).json({db, github, twitter});
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
  app.post('/', ({body}, res) => me.save(body, res));
  app.patch('/', ({body}, res) => me.save(body, res, true));
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
