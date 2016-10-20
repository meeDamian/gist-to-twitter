-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
CREATE TABLE data (
  hash        TEXT REFERENCES refs (hash),

  country     TEXT,
  city        TEXT,
  phone       TEXT,
  at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TABLE IF EXISTS data;
