'use strict';

let me = {};

me.locString = function (_, {country, city}, sep = ', ') {
  return [country, city].join(sep);
};

me.emojiString = function (_, {flag, city, phone}) {
  return [
    flag || undefined,
    city || undefined,
    phone ? `📱 ${phone}` : undefined
  ].filter(v => Boolean(v)).join(' ');
};

me.normalize = function ({flag}, {country, city, phone, at}, extended = false) {
  const out = {};

  if (country && typeof country === 'string') {
    out.country = country.trim();
    out.flag = flag(out.country);
  }

  if (city && typeof city === 'string') {
    out.city = city.trim();
  }

  if (phone && typeof phone === 'string') {
    out.phone = phone.trim();
  }

  if (extended) {
    if (Object.keys(out).length > 1) {
      out.text = me.emojiString(out);
    }

    if (at) {
      out.at = at;
    }
  }

  return out;
};

me.theSame = function (_, a, b, exactly = false) {
  return ['country', 'city', 'phone', 'flag'].filter(p => {
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

    return exactly ?
      A !== B :
      A.toLowerCase() !== B.toLowerCase();
  }).length === 0;
};

me.onlyRemoves = function (_, a, b) {
  return ['country', 'city', 'phone']
    .map(p => b[p] && a[p] !== b[p]) // 2nd empty and both not empty
    .filter(v => v)
    .length === 0;
};

me.reformat = function (_, hash, body) {
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
  };
};

me = require('mee')(module, me, {
  flag: require('country-emoji').flag
});
