-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
ALTER TABLE pipes DROP CONSTRAINT pipes_pkey;
ALTER TABLE pipes ADD PRIMARY KEY (gist);
ALTER TABLE pipes DROP IF EXISTS id;

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
ALTER TABLE pipes ADD id SERIAL;
ALTER TABLE pipes DROP CONSTRAINT pipes_pkey;
ALTER TABLE pipes ADD PRIMARY KEY (id);
