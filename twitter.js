'use strict';

const HASHTAG = '#onthemove';

let me = {
  HASHTAG
};

me.reqData = function ({request, process: {env: {TWITTER_KEY, TWITTER_SECRET}}}, {token, secret}) {
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

me.req = function (_, req, params) {
  return new Promise((resolve, reject) => {
    req(params, (err, res, json) => {
      if (err || res.statusCode !== 200) {
        reject(err || json);
        return;
      }

      resolve(json);
    });
  });
};

me.getLastTweet = function (_, req, user) {
  return me.req(req, {
    url: 'https://api.twitter.com/1.1/statuses/user_timeline.json',
    method: 'get',
    qs: {
      count: 200,
      screen_name: user,
      include_rts: false,
      contributor_details: false,
      exclude_replies: true,
      trim_user: true
    }
  })
  .then(json => {
    return json
      .filter(({text}) => text.indexOf(HASHTAG) !== -1)
      .map(({text}) => text)[0];
  })
  .catch(err => (err && err.message) || new Error(`Can't fetch user(${user}) tweets`));
};

me.format = function ({local}, data) {
  return `${local.emojiString(data)} ${HASHTAG}`;
};

me.getPlaceId = function (_, req, {country, city}) {
  return me.req(req, {
    url: 'https://api.twitter.com/1.1/geo/search.json',
    method: 'get',
    qs: {
      query: `${city} ${country}`,
      granularity: 'city',
      max_results: 1
    }
  })
  .then(({result}) => result.places[0].id)
  .catch(err => (err && err.message) || new Error(`Can't get place ID`));
};

me.getMediaId = function ({maps}, req, prev, curr) {
  return me.req(req, {
    url: 'https://upload.twitter.com/1.1/media/upload.json',
    formData: {
      media: maps.downloadStream(prev, curr)
    }
  })
  .then(({media_id_string}) => media_id_string)
  .catch(err => (err && err.message) || new Error(`Can't upload image to Twitter`));
};

me.postTweet = function (_, req, curr) {
  return ([mediaId, placeId]) => {
    const qs = {
      status: me.format(curr),
      trim_user: true
    };

    if (placeId) {
      qs.place_id = placeId;
    }

    if (mediaId) {
      qs.media_ids = mediaId;
    }

    return me.req(req, {
      qs, url: 'https://api.twitter.com/1.1/statuses/update.json'
    })
    .then(() => undefined)
    .catch(err => (err && err.message) || new Error(`Can't post status update: ${err.errors || err}`));
  };
};

me.prepareAndSend = function (_, req, prev, curr) {
  return Promise.all([
    me.getMediaId(req, prev, curr),
    me.getPlaceId(req, curr)
  ])
  .then(me.postTweet(req, curr))
  .catch(err => {
    console.error(err.message);
    return err.message;
  });
};

me.tweet = function ({local}, {twitter, prev, curr}) {
  // [instant] prevent if the same data cached in db
  if (local.theSame(prev, curr, true)) {
    return;
  }

  const req = me.reqData(twitter);

  // [slow] prevent if last tweet is the same
  return me.getLastTweet(req, twitter.user)
    .then(tweet => {
      if (tweet.indexOf(curr.flag) !== -1 && tweet.indexOf(curr.city) !== -1) {
        return;
      }

      return me.prepareAndSend(req, prev, curr);
    });
};

me = require('mee')(module, me, {
  request: require('request'),

  local: require('./local'),
  maps: require('./maps'),

  process
});
