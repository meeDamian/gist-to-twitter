'use strict';

const https = require('https');
const pg = require('pg-promise')();

const db = pg(process.env.DATABASE_URL);

function getGistJson({gist}) {
  return new Promise(resolve => {
    https.get(`https://api.github.com/gists/${gist}`, res => {
      const body = '';

      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', err => {
      console.error(`Error downloading gist: ${gist}`);
      resolve(null);
    });
  });
}

db.any('SELECT * FROM pipes')
  .then(data => {
    return Promise.All(data.map(getGistJson))
      .then(x => {
        console.log(x.files);
      });
  })
  .then()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
