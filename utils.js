'use strict';

let me = {};

me.hash = function ({crypto}, string) {
  return crypto.createHash('sha256')
    .update(string)
    .digest('hex');
};

me.toPublic = function (_, hash) {
  return me.hash(`${hash}->publicId`).substring(0, 8);
};

me = require('mee')(module, me, {
  crypto: require('crypto')
});
