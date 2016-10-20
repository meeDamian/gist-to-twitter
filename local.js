'use strict';

let me = {};

me.emojiString = function({u: {empty}, flag}, {country, city, phone}) {
  return [
    flag(country),
    city || undefined,
    phone ? `📱 ${phone}` : undefined
  ].filter(empty).join(' ');
};

me.normalize = function(_, {country, city, phone, at}, extended = false) {
  const out = {};

  if (country && typeof country === 'string') {
    out.country = country.trim();
  }

  if (city && typeof city === 'string') {
    out.city = city.trim();
  }

  if (phone && typeof phone === 'string') {
    out.phone = phone.trim();
  }

  if (extended) {
    if (Object.keys(out).length > 1) {
      out.text = me.emojiString({country, city, phone});
    }

    if (at) {
      out.at = at;
    }
  }

  return out;
};

me.theSame = function(_, a, b, exactly = false) {
  return ['country', 'city', 'phone'].filter(p => {
    const A = a[p];
    const B = b[p];

    // both are empty
    if (!A && !B) {
      return false;
    }

    // only one is empty
    if (!A || !B) {
      return true;
    }

    return exactly
      ? A !== B
      : A.toLowerCase() !== B.toLowerCase();
  }).length === 0;
};

me.reformat = function(_, hash, body) {
  return data => {
    const struct = {
      hash,
      prev: me.normalize(data, true),
      curr: me.normalize(body, true)
    };

    if (data.githubname && data.github_token && data.gist) {
      struct.github = {
        user: data.githubname,
        token: data.github_token,
        gist: data.gist
      };
    }

    if (data.twittername && data.twitter_token && data.twitter_secret) {
      struct.twitter = {
        user: data.twittername,
        token: data.twitter_token,
        secret: data.twitter_secret
      };
    }

    return struct;
  }
};

me = require('mee')(module, me, {
  u: require('./u'),

  flag: require('country-emoji').flag
});
