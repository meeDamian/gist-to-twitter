'use strict';

let me = {};

me.handleNoHash = function({db}, hash) {
  return data => {
    if (!data) {
      return db.new(hash)
        .then(() => ({hash}))
        .catch(err => {
          throw new Error(`Error creating hash(${hash}): ${err.message}`);
        })
    }

    return data;
  };
};

me.handleSave = function({db, local: {theSame}}, {hash, prev, curr}) {
  if (theSame(prev, curr, true)) {
    return;
  }

  return db.save(hash, curr)
    .then(() => undefined)
    .catch(err => {
      console.log(1, err);
      return `Can't save to db ${hash}: ${err.message}`;
    });
};

me.save = function({utils, local: {normalize, reformat}, db, gist, twitter}, {body}, res) {
  if (!body.hash) {
    res.status(401).json({err: `'hash' must be provided`});
    return;
  }

  // produce public & dispose private
  const hash = utils.toPublic(body.hash);
  body.hash = undefined;
  delete body.hash;

  // remove everything except `country, city and phone` and trim them
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
    .then(([db = 'done', github = 'done', twitter = 'done']) => {
      res.status(200).json({message: {db, github, twitter}});
      return;
    })
    .catch(err => {
      res.status(500).send(err);
      return;
    });
};

me.main = function({express, maps, process: {env: {PORT = 3000}}, jsonParser}) {
  const app = express();
  app.use(jsonParser);
  app.post('/', me.save);
  app.get('/', (req, res) => res.status(200).send('OK'));
  app.get('/img/:a/:b/:c/:d', (req, res) => {
    const {a, b, c, d} = req.params;
    const url = maps.getPathUrl({country:a, city: b}, {country:c, city:d});
    res.status(200).send(`<code>${url}</code><br><img src="${url}">`);
  });
  app.listen(PORT);
};

me = require('mee')(module, me, {
  express: require('express'),
  jsonParser: require('body-parser').json(),

  twitter: require('./twitter'),
  utils: require('./utils'),
  local: require('./local'),
  maps: require('./maps'),
  gist: require('./gist'),
  db: require('./db'),

  process
});
