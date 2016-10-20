
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION log_change(hash TEXT, what TEXT, value TEXT) RETURNS VOID AS $$
BEGIN
  INSERT INTO updates (hash, what, value)
  VALUES (hash, what, value);
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_inserts() RETURNS trigger AS $$
BEGIN
  IF NEW.vanity IS NOT NULL
  THEN
    PERFORM log_change(NEW.hash, 'vanity', NEW.vanity);
  END IF;

  IF NEW.phone IS NOT NULL
  THEN
    PERFORM log_change(NEW.hash, 'phone', NEW.phone);
  END IF;

  IF NEW.country IS NOT NULL
  THEN
    PERFORM log_change(NEW.hash, 'country', NEW.country);
  END IF;

  IF NEW.city IS NOT NULL
  THEN
    PERFORM log_change(NEW.hash, 'city', NEW.city);
  END IF;

  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER log_inserts_trigger BEFORE INSERT
ON latest FOR EACH ROW
EXECUTE PROCEDURE log_inserts();
-- +goose StatementEnd

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TRIGGER log_inserts_trigger ON latest;
DROP FUNCTION log_inserts();
DROP FUNCTION log_change(TEXT, TEXT, TEXT);
