/*
 Prevents changes to teleIDs when the teleID is not null
 */
CREATE

OR REPLACE FUNCTION check_teleId() RETURNS TRIGGER AS $$ BEGIN IF (OLD."telegramId" is NULL)
OR (OLD."telegramId" = NEW."telegramId") THEN RETURN NEW;

END IF;

RETURN NULL;

END;

$$ LANGUAGE plpgsql;

CREATE TRIGGER update_telegramId BEFORE
UPDATE
    ON "User" FOR EACH ROW EXECUTE FUNCTION check_teleID();
