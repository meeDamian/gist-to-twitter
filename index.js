'use strict';

const pg = require('pg-promise')();

const db = pg(process.env.DATABASE_URL);

db.any('SELECT * FROM pipes')
  .then(data => {
    data.forEach(x => {
      console.log(x);
    });

    console.log('everything did finish!');
    // process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
