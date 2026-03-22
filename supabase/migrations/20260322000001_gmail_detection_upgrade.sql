-- ═══════════════════════════════════════════════════
-- BeforeCharge — Gmail Detection Engine Upgrade
-- Enhanced subscription detection with confidence scoring
-- ═══════════════════════════════════════════════════

-- Add new columns to subscriptions table for enhanced detection
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS confidence INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS detected_from TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS detection_layers TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS raw_email_data JSONB;

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.confidence IS 'Detection confidence score 0-99 (60+ = high confidence)';
COMMENT ON COLUMN subscriptions.detected_from IS 'Source: gmail, manual, api';
COMMENT ON COLUMN subscriptions.detection_layers IS 'Which detection layers matched: known_sender, domain_pattern, subject_receipt, etc';
COMMENT ON COLUMN subscriptions.raw_email_data IS 'Original email metadata for debugging';

-- Create index for confidence-based queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_confidence ON subscriptions(confidence);
CREATE INDEX IF NOT EXISTS idx_subscriptions_detected_from ON subscriptions(detected_from);

-- ── SCAN HISTORY TABLE ────────────────────────────────
-- Track Gmail scan history and results
CREATE TABLE IF NOT EXISTS scan_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  emails_scanned INTEGER DEFAULT 0,
  subs_found INTEGER DEFAULT 0,
  subs_new INTEGER DEFAULT 0,
  subs_updated INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed',
  error_message TEXT,
  scan_duration_ms INTEGER,
  CONSTRAINT scan_history_status_check CHECK (status IN ('completed', 'failed', 'in_progress'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_scanned_at ON scan_history(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_history_status ON scan_history(status);

-- Enable RLS
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users see own scan history"
  ON scan_history FOR ALL
  USING (auth.uid() = user_id);

-- ── USER TOKENS TABLE (if not exists) ─────────────────
-- Store Gmail OAuth tokens
CREATE TABLE IF NOT EXISTS user_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  gmail_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_expiry ON user_tokens(token_expiry);

-- Enable RLS
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users see own tokens"
  ON user_tokens FOR ALL
  USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_tokens_updated_at
  BEFORE UPDATE ON user_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ── HELPER FUNCTION: Get scan statistics ──────────────
CREATE OR REPLACE FUNCTION get_scan_statistics(p_user_id UUID)
RETURNS TABLE (
  total_scans INTEGER,
  last_scan_date TIMESTAMPTZ,
  total_subs_found INTEGER,
  avg_confidence NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_scans,
    MAX(scanned_at) as last_scan_date,
    COALESCE(SUM(subs_found), 0)::INTEGER as total_subs_found,
    COALESCE(AVG(s.confidence), 0)::NUMERIC as avg_confidence
  FROM scan_history sh
  LEFT JOIN subscriptions s ON s.user_id = sh.user_id AND s.detected_from = 'gmail'
  WHERE sh.user_id = p_user_id AND sh.status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
