-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION log_updates() RETURNS trigger AS $$
BEGIN
  IF (OLD.vanity IS NULL AND NEW.vanity IS NOT NULL) OR NEW.vanity <> OLD.vanity
  THEN
    PERFORM log_change(NEW.hash, 'vanity', NEW.vanity);
  END IF;

  IF (OLD.phone IS NULL AND NEW.phone IS NOT NULL) OR NEW.phone <> OLD.phone
  THEN
    PERFORM log_change(NEW.hash, 'phone', NEW.phone);
  END IF;

  IF (OLD.country IS NULL AND NEW.country IS NOT NULL) OR NEW.country <> OLD.country
  THEN
    PERFORM log_change(NEW.hash, 'country', NEW.country);
  END IF;

  IF (OLD.city IS NULL AND NEW.city IS NOT NULL) OR NEW.city <> OLD.city
  THEN
    PERFORM log_change(NEW.hash, 'city', NEW.city);
  END IF;

  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER log_updates_trigger BEFORE UPDATE
ON latest FOR EACH ROW
EXECUTE PROCEDURE log_updates();
-- +goose StatementEnd

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TRIGGER log_updates_trigger ON latest;
DROP FUNCTION log_updates();
