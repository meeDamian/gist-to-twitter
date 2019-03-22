'use strict';

const JSONFILE = 'location.json';
const TEXTFILE = 'location.txt';
const ERR_NOT_FOUND = 'Not Found';
const USER_AGENT = {'User-Agent': 'meeDamian'};
const URL = 'https://api.github.com/gists';
const GITHUB_AUTH = `client_id=${process.env.GITHUB_ID}&client_secret=${
	process.env.GITHUB_SECRET
}`;

let me = {
	JSONFILE,
	TEXTFILE,
	ERR_NOT_FOUND,
	USER_AGENT,
	URL,
	GITHUB_AUTH
};

me.download = function ({request}, gist) {
	return new Promise((resolve, reject) => {
		request.get(
			{
				url: `${URL}/${gist}?${GITHUB_AUTH}`,
				headers: USER_AGENT,
				json: true
			},
			(err, res, json) => {
				if (err || res.statusCode !== 200) {
					reject(
						err || new Error(`Can't download gist(${gist}): ${json.message}`)
					);
					return;
				}

				resolve({gist, json});
			}
		);
	});
};

me.process = function (_, {gist, json: {message, files}}) {
	if (message && message === ERR_NOT_FOUND) {
		throw new Error(`gist(${gist}) ${ERR_NOT_FOUND}`);
	}

	const out = {};

	const jsonFile = files[JSONFILE];
	if (jsonFile) {
		out.json = JSON.parse(jsonFile.content);
	}

	const textFile = files[TEXTFILE];
	if (textFile) {
		out.text = textFile.content;
	}

	return out;
};

me.preparePatch = function ({theSame}, body) {
	return ({json, text}) => {
		const files = {};

		if (!theSame(body, json, true)) {
			files[JSONFILE] = {
				content: JSON.stringify(
					{
						country: body.country,
						flag: body.flag,
						city: body.city,
						phone: body.phone
					},
					null,
					2
				)
			};
		}

		if (text !== body.text) {
			files[TEXTFILE] = {
				content: body.text
			};
		}

		return {files};
	};
};

me.update = function ({request}, {gist, token, user}) {
	return body => {
		if (Object.keys(body).length === 0) {
			return;
		}

		return new Promise((resolve, reject) => {
			request.patch(
				{
					json: true,
					body,
					auth: {user, pass: token},
					url: `${URL}/${gist}`,
					headers: USER_AGENT
				},
				(err, res, json) => {
					if (err || res.statusCode !== 200) {
						reject(
							err || new Error(`Can't edit gist(${gist}): ${json.message}`)
						);
						return;
					}

					resolve(json);
				}
			);
		});
	};
};

me.doThings = function (_, {github, curr}) {
	if (!github) {
		return 'No account configured';
	}

	return me
		.download(github.gist)
		.then(me.process)
		.then(me.preparePatch(curr))
		.then(me.update(github))
		.then(data => {
			if (data) {
				return {id: data.id};
			}
		})
		.catch(error => {
			console.error(error.message);
			return {err: error.message};
		});
};

me = require('mee')(module, me, {
	request: require('request'),
	theSame: require('./local').theSame
});
