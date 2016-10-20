-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION process_vanity() RETURNS trigger AS $$
BEGIN
  NEW.vanity = TRIM(BOTH '  ' FROM NEW.vanity);

  -- check for vanity-hash collisions
  IF EXISTS(
      SELECT  1
      FROM    latest
      WHERE   LOWER(NEW.vanity) = LOWER(hash)
        AND   NEW.hash <> hash
      LIMIT   1
    )
  THEN
    RAISE EXCEPTION 'This vanity is not available.';
  END IF;

  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER save_vanity_update BEFORE INSERT OR UPDATE
ON latest FOR EACH ROW
EXECUTE PROCEDURE process_vanity();
-- +goose StatementEnd

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TRIGGER save_vanity_update ON latest;
DROP FUNCTION process_vanity();
