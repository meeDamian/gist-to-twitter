-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
ALTER TABLE pipes ADD hash TEXT UNIQUE;

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
ALTER TABLE pipes DROP IF EXISTS hash;
