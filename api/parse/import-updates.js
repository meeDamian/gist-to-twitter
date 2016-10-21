'use strict';

const pg = require('pg-promise')();
const updates = require('./Updates.json').results;

const data = updates.filter(({hash}) => hash === 'dcb83c4e' || hash === 'a0b725b8')
  .map(({key, newVal, createdAt}) => `('dcb83c4e', '${key}', '${newVal}', '${createdAt}'::timestamp)`);

const query = `INSERT INTO updates (hash, what, value, created_at) VALUES ${data.join(', ')}`;

const db = pg(process.env.DATABASE_URL);

db.query(query);
