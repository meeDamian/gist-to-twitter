-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
CREATE TABLE updates (
	hash       TEXT NOT NULL,
	what       TEXT,
	value      TEXT,

	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TABLE updates;
