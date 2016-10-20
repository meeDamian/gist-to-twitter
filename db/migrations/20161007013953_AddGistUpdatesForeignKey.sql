-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
ALTER TABLE gist_updates ADD CONSTRAINT gists FOREIGN KEY (gist) REFERENCES pipes (gist) MATCH FULL;

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
ALTER TABLE gist_updates DROP CONSTRAINT IF EXISTS gists;
