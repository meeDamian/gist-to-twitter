'use strict';

import test from 'ava';

const MOCK = {
  db: () => {
    return () => {
      return {
        none: (sql, params) => [sql, params],
        oneOrNone: (sql, params) => [sql, params]
      };
    };
  },
  process: {
    env: {
      DATABASE_URL: 'nope'
    }
  }
};

const {get, save, newHash} = require('../db')(MOCK);

test('exports properly', t => {
  if (!get || !save || !newHash) {
    t.fail();
  }
});

test('proper get()', t => {
  const [sql, params] = get('magic-hash');

  if (params[0] !== 'magic-hash') {
    t.fail(`${JSON.stringify(params).replace('\n', '')} should contain 'magic-hash'`);
  }

  if (sql.indexOf('$1') === -1) {
    t.fail(`SQL must contain $1`);
  }
});

test('proper save()', t => {
  const [sql, params] = save('magic-hash', {
    country: 'Sri Lanka',
    city: 'Colombo',
    phone: '+94 0000000000'
  });

  const VALS = ['magic-hash', 'Sri Lanka', 'Colombo', '+94 0000000000'];

  VALS.forEach((v, i) => {
    if (v !== params[i]) {
      t.fail(`${JSON.stringify(params).replace('\n', '')} should have params[${i}] === '${v}'`);
    }

    if (sql.indexOf(`$${i + 1}`) === -1) {
      t.fail(`SQL must contain $${i + 1}`);
    }
  });
});

test('proper newHash()', t => {
  const [sql, params] = newHash('magic-hash');

  if (params[0] !== 'magic-hash') {
    t.fail(`${JSON.stringify(params).replace('\n', '')} should contain 'magic-hash'`);
  }

  if (sql.indexOf('$1') === -1) {
    t.fail(`SQL must contain $1`);
  }
});
