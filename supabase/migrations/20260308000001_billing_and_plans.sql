-- Billing + plans scaffolding
-- Adds basic plan fields on `profiles` and a `payment_transactions` table.

-- 1) Add plan fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan_provider TEXT;

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_type_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_plan_type_check
    CHECK (plan_type IN ('free', 'premium', 'enterprise'));

-- 2) Payment transactions table (for audit + reconciliation)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'razorpay')),
  payment_intent_id TEXT,
  order_id TEXT,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed')),
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CHECK (
    (payment_provider = 'stripe' AND payment_intent_id IS NOT NULL AND order_id IS NULL)
    OR
    (payment_provider = 'razorpay' AND order_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS payment_transactions_stripe_pi_unique
  ON payment_transactions(payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payment_transactions_razorpay_order_unique
  ON payment_transactions(order_id)
  WHERE order_id IS NOT NULL;

-- Enable RLS (service role still bypasses it for edge functions)
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can see their own transactions
DROP POLICY IF EXISTS "Users can read own payment transactions" ON payment_transactions;
CREATE POLICY "Users can read own payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

