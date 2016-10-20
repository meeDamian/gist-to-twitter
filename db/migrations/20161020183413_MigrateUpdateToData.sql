
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
INSERT
INTO data (hash, country, city, phone, at)
SELECT 'dcb83c4e', country, city, phone, at
FROM update
ORDER BY at DESC;

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
TRUNCATE data;
