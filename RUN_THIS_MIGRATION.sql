-- ============================================
-- IMPORTANT: Run this in Supabase SQL Editor
-- ============================================
-- 
-- Steps:
-- 1. Go to your Supabase Dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New Query"
-- 4. Copy and paste this entire file
-- 5. Click "Run" or press Cmd/Ctrl + Enter
--
-- This adds Gmail fetch tracking columns to the profiles table
-- ============================================

-- Add Gmail auto-fetch tracking columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS gmail_fetch_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS gmail_last_fetch_at TIMESTAMPTZ;

-- Add helpful comments
COMMENT ON COLUMN profiles.gmail_fetch_count IS 'Number of times user has used Gmail auto-fetch';
COMMENT ON COLUMN profiles.gmail_last_fetch_at IS 'Timestamp of last Gmail auto-fetch attempt';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_gmail_fetch ON profiles(gmail_fetch_count, gmail_last_fetch_at);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('gmail_fetch_count', 'gmail_last_fetch_at')
ORDER BY column_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'Gmail fetch tracking columns have been added to the profiles table.';
END $$;
