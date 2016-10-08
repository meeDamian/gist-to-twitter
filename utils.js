'use strict';

let me = {};

me.hash = function({crypto}, string) {
  return crypto.createHash('sha256')
    .update(string)
    .digest('hex');
};

me = require('mee')(module, me, {
  crypto: require('crypto')
});
