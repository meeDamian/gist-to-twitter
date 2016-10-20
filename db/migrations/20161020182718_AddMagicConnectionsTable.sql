-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
CREATE TABLE refs (
  hash        TEXT PRIMARY KEY,
  twitter_id  INT REFERENCES twitter (twitter_id),
  github_id   INT REFERENCES github (github_id)
);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TABLE IF EXISTS refs;
