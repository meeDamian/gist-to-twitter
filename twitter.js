'use strict';

let me = {};

me.format = function({u: {empty}, flag}, {country, city, phone}) {
  return [
    flag(country),
    city || undefined,
    phone ? `📱 ${phone}` : undefined
  ].filter(u.empty).join(' ');
};

me.tweet = function(_, {text, token, secret}) {

};

me = require('mee')(module, me, {
  flag: require('country-emoji').flag,
  u: require('./u.js')
});
