-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
ALTER TABLE refs ADD COLUMN at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW();

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
ALTER TABLE refs DROP COLUMN IF EXISTS at;
