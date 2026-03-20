-- Add Gmail auto-fetch tracking to profiles table
-- This tracks how many times a user has used the Gmail auto-fetch feature
-- Free plan users are limited to 1 fetch (lifetime, not reset on deletion)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS gmail_fetch_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS gmail_last_fetch_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN profiles.gmail_fetch_count IS 'Number of times user has used Gmail auto-fetch (lifetime count, not reset)';
COMMENT ON COLUMN profiles.gmail_last_fetch_at IS 'Timestamp of last Gmail auto-fetch attempt';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_gmail_fetch ON profiles(gmail_fetch_count, gmail_last_fetch_at);
