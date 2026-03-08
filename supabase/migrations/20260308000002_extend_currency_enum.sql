-- Extend currency enum to support additional currencies used by the app.
-- Safe to run multiple times.

DO $$
BEGIN
  -- These values are used in the frontend and should be supported in DB as well.
  ALTER TYPE currency ADD VALUE IF NOT EXISTS 'INR';
  ALTER TYPE currency ADD VALUE IF NOT EXISTS 'AED';
EXCEPTION
  WHEN duplicate_object THEN
    -- Older Postgres versions might throw duplicate_object; ignore.
    NULL;
END $$;

