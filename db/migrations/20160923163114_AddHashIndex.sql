-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
CREATE UNIQUE INDEX uniqueHashIndex ON latest (LOWER(hash));

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP INDEX uniqueHashIndex;
