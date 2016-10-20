'use strict';

let me = {};

me.req = function({request, process: {env: {TWITTER_KEY, TWITTER_SECRET}}}, {token, secret}) {
  return request.defaults({
    json: true,
    method: 'post',
    oauth: {
      consumer_key: TWITTER_KEY,
      consumer_secret: TWITTER_SECRET,
      token,
      token_secret: secret
    }
  });
};

me.format = function({emojiString}, data) {
  return `${emojiString(data)} #onthemove`;
};

me.getPlaceId = function(_, req, {country, city}) {
  return new Promise((resolve, reject) => {
    req({
      url: 'https://api.twitter.com/1.1/geo/search.json',
      method: 'get',
      qs: {
        query: `${city} ${country}`,
        granularity: 'city',
        max_results: 1
      }
    }, (err, res, json) => {
      if (err || res.statusCode !== 200) {
        reject(err || new Error(`Can't get place ID`));
        return;
      }

      resolve(json);
    });
  })
  .then(({result}) => result.places[0].id);
};

me.getMediaId = function({maps}, req, prev, curr) {
  return new Promise((resolve, reject) => {
    req({
        url: 'https://upload.twitter.com/1.1/media/upload.json',
        formData: {
          media: maps.downloadPipe(prev, curr)
        }
      }, (err, res, json) => {
        if (err || res.statusCode !== 200) {
          reject(err || new Error(`Can't upload image to Twitter ${res.statusCode}`));
          return;
        }

        resolve(json.media_id_string);
      });
    });
};

me.postTweet = function(_, req, curr) {
  return ([mediaId, placeId]) => {
    return new Promise((resolve, reject) => {
      req({
        url: 'https://api.twitter.com/1.1/statuses/update.json',
        qs: {
          status: me.format(curr),
          trim_user: true,
          place_id: placeId,
          media_ids: mediaId
        }
      }, (err, res, json) => {
        if (err || res.statusCode !== 200) {
          reject(err || new Error(`Can't post status update: ${json.errors || json}`))
          return;
        }

        resolve();
      });
    });
  };
};

me.tweet = function(_, {twitter, prev, curr}) {
  const req = me.req(twitter);

  // TODO: limit tweeting!!!

  return Promise.all([
    me.getMediaId(req, prev, curr),
    me.getPlaceId(req, curr)
  ])
  .then(me.postTweet(req, curr))
  .catch(err => err.message);
};

me = require('mee')(module, me, {
  request: require('request'),

  emojiString: require('./local').emojiString,
  maps: require('./maps'),

  process
});
