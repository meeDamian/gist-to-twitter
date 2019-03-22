'use strict';

const HASHTAG = '#onthemove';
const MAX_TWEET_FREQUENCY = 18e5; // 30 mins

let me = {
	HASHTAG,
	MAX_TWEET_FREQUENCY
};

me.reqData = function(
	{
		request,
		process: {
			env: {TWITTER_KEY, TWITTER_SECRET}
		}
	},
	{token, secret}
) {
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

me.req = function(_, req, params) {
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

me.getLastTweet = function(_, req, user) {
	console.log(`[${req.hash}:twitter:latest] Getting latest tweets…`);
	return me
		.req(req, {
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
			console.log(
				`[${req.hash}:twitter:latest] ${json.length} latest tweets downloaded`
			);
			return json
				.filter(({text}) => text.indexOf(HASHTAG) !== -1)
				.map(({text, created_at: at}) => ({text, at}))[0];
		})
		.then(tweet => {
			console.log(
				`[${req.hash}:twitter:latest] Matching tweet${
					tweet ? ' ' : ' not '
				}found`
			);
			return tweet;
		})
		.catch(error => {
			throw (error && error.message) || 'Error getting existing tweets';
		});
};

me.format = function({local}, data) {
	return `${local.emojiString(data)} ${HASHTAG}`;
};

me.getPlaceId = function({local: {locString}}, req, loc) {
	console.log(
		`[${req.hash}:twitter:place] Getting placeId for '${locString(loc)}'…`
	);
	return me
		.req(req, {
			url: 'https://api.twitter.com/1.1/geo/search.json',
			method: 'get',
			qs: {
				query: locString(loc, ' '),
				granularity: 'city',
				max_results: 1
			}
		})
		.then(({result}) => {
			const {id} = result.places[0];
			console.log(`[${req.hash}:twitter:place] PlaceId found: '${id}'`);
			return id;
		})
		.catch(() => undefined);
};

me.getMediaId = function({maps, local}, req, prev, curr) {
	console.log(
		`[${req.hash}:twitter:map] Uploading map (${local.locString(
			prev
		)} → ${local.locString(curr)})…`
	);
	return me
		.req(req, {
			url: 'https://upload.twitter.com/1.1/media/upload.json',
			formData: {
				media: maps.downloadStream(prev, curr)
			}
		})
		.then(m => {
			const id = m.media_id_string;
			console.log(`[${req.hash}:twitter:map] Map image uploaded. ID: ${id}`);
			return id;
		});
};

me.postTweet = function(_, req, curr) {
	return ([mediaId, placeId]) => {
		console.log(`[${req.hash}:twitter:tweet] Tweeting…`);

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

		return me
			.req(req, {
				qs,
				url: 'https://api.twitter.com/1.1/statuses/update.json'
			})
			.then(tweet => {
				const id = tweet.id_str;
				console.log(
					`[${
						req.hash
					}:twitter:tweet] Tweeted: https://twitter.com/statuses/${id}…`
				);
				return {id};
			})
			.catch(error => {
				throw (error && error.message) ||
					`Can't post status update: ${error.errors || error}`;
			});
	};
};

me.prepareAndSend = function(_, req, prev, curr) {
	return Promise.all([
		me.getMediaId(req, prev, curr),
		me.getPlaceId(req, curr)
	]).then(me.postTweet(req, curr));
};

me.tweet = function({local}, {twitter, hash, prev, curr}) {
	if (!twitter) {
		return {err: 'No account configured'};
	}

	// [instant] prevent if the same data cached in db
	if (local.theSame(prev, curr)) {
		console.log(`[${hash}] Not tweeting due to cache match`);
		return;
	}

	// [instant] prevent if new has everything the same, but less
	if (local.onlyRemoves(prev, curr)) {
		console.log(`[${hash}] Not tweeting info removal`);
		return;
	}

	const req = me.reqData(twitter);
	req.hash = hash;

	// [slow] prevent based on previous tweet
	return me
		.getLastTweet(req, twitter.user)
		.then(({text = '', at = 0}) => {
			// Don't send if previous tweet from the same country and city
			if (text.indexOf(curr.flag) !== -1 && text.indexOf(curr.city) !== -1) {
				console.log(
					`[${hash}] Not tweeting the same tweet twice in a row: '${curr.text}'`
				);
				return;
			}

			// Throttle tweeting to once every MAX_TWEET_FREQUENCY
			if (new Date(new Date(at).getTime() + MAX_TWEET_FREQUENCY) > new Date()) {
				console.log(`[${hash}] Tweeting throttled: '${curr.text}'`);
				return;
			}

			return me.prepareAndSend(req, prev, curr);
		})
		.catch(error => {
			console.error(error);
			return {err: error};
		});
};

me = require('mee')(module, me, {
	request: require('request'),

	local: require('./local'),
	maps: require('./maps'),

	process
});
