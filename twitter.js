'use strict';

let me = {};

me.req = function({request, process: {env: {TWITTER_KEY, TWITTER_SECRET}}}, {token, secret}, {method, url, qs}) {
  return new Promise((resolve, reject) => {
    request({
      method,
      url,
      qs,

      json: true,
      oauth: {
        consumer_key: TWITTER_KEY,
        consumer_secret: TWITTER_SECRET,
        token,
        token_secret: secret
      }
    }, (err, res, json) => {
      if (err || res.statusCode !== 200) {
        reject(err || new Error(`${url} ${JSON.stringify(json, null, 2)}`));
        return;
      }

      resolve(json);
    });
  })
  .catch(err => {
    console.error('Twitter error:', err.message);
    return;
  });
};

me.format = function({u: {empty}, flag}, {country, city, phone}) {
  return [
    flag(country),
    city || undefined,
    phone ? `📱 ${phone}` : undefined,
    '#onthemove'
  ].filter(empty).join(' ');
};

me.getPlace = function(_, twitter, {country, city}) {
  return me.req(twitter, {
    method: 'get',
    url: 'https://api.twitter.com/1.1/geo/search.json',
    qs: {
      query: `${city} ${country}`,
      granularity: 'city',
      max_results: 1
    }
  })
  .then(({result}) => result.places[0]);
};

me.tweet = function(_, {twitter, gist}) {
  return me.getPlace(twitter, gist)
    .then(place => {
      return me.req(twitter, {
        method: 'post',
        url: 'https://api.twitter.com/1.1/statuses/update.json',
        qs: {
          status: me.format(gist),
          trim_user: true,
          place_id: place.id
        }
      })
      .then(twitter => ({gist, twitter}));
    });
};

me = require('mee')(module, me, {
  flag: require('country-emoji').flag,
  request: require('request'),

  u: require('./u.js'),

  process
});
