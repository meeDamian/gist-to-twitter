'use strict';

let me = {};

me.locString = function (_, {country, city}) {
	return `${city},${country}`;
};

me.uriMarker = function (_, loc) {
	return [
		'color:red',
		'size:mid',
		me.locString(loc) // NOTE: has to be last
	].join('|');
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
		`markers=${me.uriMarker(locTo)}`,
		'size=640x480',
		'format=png'
	];

	if (locFrom.country && locFrom.city) {
		query.push(`path=${me.uriPath(locFrom, locTo)}`);
	}

	return encodeURI(
		`https://maps.googleapis.com/maps/api/staticmap?${query.join(
			'&'
		)}&key=${MAPS_KEY}`
	);
};

me.downloadStream = function ({request}, locFrom, locTo) {
	const url = me.getMapUrl(locFrom, locTo);
	console.log(url);
	return request.get(url);
};

me = require('mee')(module, me, {
	request: require('request'),
	process
});
