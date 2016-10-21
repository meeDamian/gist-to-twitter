'use strict';

let me = {};

me.locString = function (_, {country, city}) {
  return `${city},${country}`;
};

me.uriMarker = function (_, loc, dest = true) {
  const marker = [
    `label:${dest ? 'B' : 'A'}`,
    `color:${dest ? 'red' : 'gray'}`
  ];

  if (!dest) {
    marker.push('size:mid');
  }

  // NOTE: has to be last
  marker.push(me.locString(loc));

  return marker.join('|');
};

me.uriPath = function (_, locFrom, locTo) {
  return [
    'color:blue',
    'geodesic:true',
    'weight:4',
    me.locString(locFrom),
    me.locString(locTo)
  ].join('|');
};

me.getMapUrl = function ({process: {env: {MAPS_KEY}}}, locFrom, locTo) {
  const query = [
    `markers=${me.uriMarker(locFrom, false)}`,
    `markers=${me.uriMarker(locTo)}`,
    `path=${me.uriPath(locFrom, locTo)}`,
    'size=640x480',
    'format=png'
  ].join('&');

  return encodeURI(`https://maps.googleapis.com/maps/api/staticmap?${query}&key=${MAPS_KEY}`);
};

me.downloadStream = function ({request}, locFrom, locTo) {
  return request.get(me.getMapUrl(locFrom, locTo));
};

me = require('mee')(module, me, {
  request: require('request'),
  process
});
