'use strict';

const crypto = require('crypto');
const pg = require('pg-promise')();
const app = require('express')();
const {json} = require('body-parser');

const db = pg(process.env.DATABASE_URL);

function returnError(res, error) {
  return err => {
    console.error(err);
    error = error || err.message;
    res.status(404).jsonp({error});
  };
}

function returnSuccess(res) {
  return data => res.status(200).jsonp(data);
}

function removeEmpty(obj) {
  Object.keys(obj)
    .filter(v => obj[v] === null || obj[v] === undefined)
    .map(v => delete obj[v]);

  return obj;
}

function getData(req, res) {
  db.one('SELECT * FROM latest WHERE LOWER(hash) = LOWER($1) OR LOWER(vanity) = LOWER($1)', req.params.vanity)
    .then(removeEmpty)
    .then(returnSuccess(res))
    .catch(returnError(res, 'record not found'));
}

function makeHash(obj) {
  if (!obj.key) {
    throw new Error('key is required, but missing');
  }

  obj.hash = crypto.createHash('sha256')
    .update(`${obj.key}`)
    .digest('hex')
    .substring(0, 8);

  delete obj.key;

  return obj;
}

function validate(obj) {
  const {vanity, phone, city, country} = obj;

  if (phone && !/[\d\-\(\)\.\+ ]+/.test(phone)) {
    throw new Error('phone number seems wrong');
  }

  if (vanity && !/^[a-z0-9]+$/i.test(vanity)) {
    throw new Error('vanity has to be alphanumeric');
  }

  const geoMatch = /^[a-z0-9 \-\.]+$/i;
  if (city && !geoMatch.test(city)) {
    throw new Error('city has to be (mostly) alphanumeric');
  }

  if (country && !geoMatch.test(country)) {
    throw new Error('country has to be (mostly) alphanumeric');
  }

  return obj;
}

function upsert(data) {
  const keys = Object.keys(data).filter(k => k !== 'hash');
  if (keys.length === 0) {
    throw new Error('Nothing to update…');
  }

  const names = keys.join(', ');
  const placeholders = keys.map((_, i) => `$${i + 2}`).join(', ');
  const query = `INSERT INTO latest (hash, ${names})
    VALUES ($1, ${placeholders})
    ON CONFLICT (hash)
    DO UPDATE SET (${names}) = (${placeholders})
    WHERE latest.hash = $1
    RETURNING hash`;

  return [query, [data.hash, ...keys.map(k => data[k] === false ? '' : data[k])]];
}

function saveData(req, res) {
  Promise.resolve(req.body)
    .then(makeHash)
    .then(removeEmpty)
    .then(validate)
    .then(data => db.one(...upsert(data)))
    .then(returnSuccess(res))
    .catch(returnError(res));
}

app.set('port', process.env.PORT || 5000);
app.use(json());

app.get('/:vanity', getData);
app.post('/', saveData);
app.get('/', (_, res) => res.redirect('https://meedamian.com/about'));

const server = app.listen(app.get('port'));

// Cleanup
process.stdin.resume();
process.on('SIGINT', err => {
  console.error(err);
  server.close();
  pg.end();
});
