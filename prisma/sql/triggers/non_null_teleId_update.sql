/*
 Prevents updates on teleIDs where the teleID is not null
 */

CREATE OR REPLACE FUNCTION check_teleID()
RETURNS TRIGGER AS $$
BEGIN 
    IF (OLD."telegramId" is NULL) THEN
        RETURN NEW;
    END IF;
	RETURN NULL;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_telegramID
BEFORE UPDATE ON "User"
FOR EACH ROW EXECUTE FUNCTION check_teleID();