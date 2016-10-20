-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION attach_location_update_date() RETURNS trigger AS $$
BEGIN
  NEW.city = TRIM(BOTH '  ' FROM NEW.city);
  NEW.country = TRIM(BOTH '  ' FROM NEW.country);

  IF LOWER(NEW.city) <> LOWER(OLD.city) OR LOWER(NEW.country) <> LOWER(OLD.country)
  THEN
    NEW.relocated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER save_location_update BEFORE UPDATE
ON latest FOR EACH ROW
EXECUTE PROCEDURE attach_location_update_date();
-- +goose StatementEnd

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TRIGGER save_location_update ON latest;
DROP FUNCTION attach_location_update_date();
