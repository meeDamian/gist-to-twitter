-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
CREATE TABLE twitter (
  twitter_id  SERIAL NOT NULL PRIMARY KEY,
  username    TEXT NOT NULL,
  token       TEXT NOT NULL,
  secret      TEXT NOT NULL
);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TABLE IF EXISTS twitter;
