-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
WITH updates_agg AS (
  SELECT  hash,
          DATE_TRUNC('second', created_at) AS at,
          ARRAY_AGG(what) AS columns,
          ARRAY_AGG(value) AS whats

  FROM    updates
  GROUP   BY 1, 2
  ORDER   BY at
)
INSERT INTO update (gist, at, country, city, phone) (
  SELECT  'd881897abb1b251a912d8a31c2b59298',
          at,

          -- country
          CASE WHEN columns[1] = 'country' THEN whats[1]
               WHEN columns[2] = 'country' THEN whats[2]
               ELSE NULL
          END,

          -- city
          CASE WHEN columns[1] = 'city' THEN whats[1]
               WHEN columns[2] = 'city' THEN whats[2]
               ELSE NULL
          END,

          -- phone
          CASE WHEN columns[1] = 'phone' THEN whats[1]
               WHEN columns[2] = 'phone' THEN whats[2]
               ELSE NULL
          END

  FROM    updates_agg
);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
TRUNCATE TABLE update;
