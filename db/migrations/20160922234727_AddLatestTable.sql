-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
CREATE TABLE latest (
	hash     TEXT NOT NULL PRIMARY KEY,
	city     TEXT,
	country  TEXT,
	phone    TEXT,
	vanity   TEXT,

	relocated_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
	created_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);


-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TABLE latest;
