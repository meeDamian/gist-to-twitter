-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
CREATE TABLE pipes (
	id             SERIAL PRIMARY KEY,
	gist           TEXT,
	twitter_token  TEXT,
	twitter_secret TEXT
);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TABLE pipes;
