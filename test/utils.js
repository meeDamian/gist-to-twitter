'use strict';

import test from 'ava';

const {hash, toPublic} = require('../utils');

test('exports properly', t => {
	if (!hash || !toPublic) {
		t.fail();
		return;
	}

	t.pass();
});

test('produces correct hashes', t => {
	const out = hash('produces correct hashes');

	if (
		out !== '364f5695ebe09a8121199480e1bdcc84ab375f722b934aa7ace77df1ad1da06d'
	) {
		t.fail(
			`${out} instead of '364f5695ebe09a8121199480e1bdcc84ab375f722b934aa7ace77df1ad1da06d'`
		);
		return;
	}

	t.pass();
});

test('produces correct publicId', t => {
	const out = toPublic(
		'364f5695ebe09a8121199480e1bdcc84ab375f722b934aa7ace77df1ad1da06d'
	);

	if (out !== '64d293c5') {
		t.fail(`${out} instead of '64d293c5'`);
		return;
	}

	t.pass();
});
