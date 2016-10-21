-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
DROP TABLE IF EXISTS gist_updates;
DROP TABLE IF EXISTS update;
DROP TABLE IF EXISTS updates;
DROP TABLE IF EXISTS pipes;
DROP TABLE IF EXISTS latest;

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
SELECT 'go to ./backups dir and restore from there…';
