-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
ALTER TABLE pipes ADD gh_token TEXT;

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
ALTER TABLE pipes DROP IF EXISTS gh_token;
