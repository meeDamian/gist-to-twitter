-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
CREATE TABLE gist_updates (
	id     SERIAL PRIMARY KEY,
	gist   TEXT,
	hash   TEXT,
  at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TABLE gist_updates;
