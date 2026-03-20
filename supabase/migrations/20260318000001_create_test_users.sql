-- Create test users with different subscription plans
-- Note: These users will be created in the auth.users table
-- Passwords are hashed using Supabase's auth system

-- Test User 1: Free Plan
-- Email: test.free@beforecharge.com
-- Password: TestFree123!

-- Test User 2: Premium Plan
-- Email: test.premium@beforecharge.com
-- Password: TestPremium123!

-- Insert test users into auth.users (this requires service role access)
-- In practice, you should create these users through the Supabase Dashboard or Auth API

-- Create profiles for test users (assuming they sign up normally)
-- We'll create the profile structure that will be populated when users sign up

-- Function to create test data for a user
CREATE OR REPLACE FUNCTION create_test_user_data(
  p_user_id UUID,
  p_plan_type TEXT DEFAULT 'free'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_category_id UUID;
  v_subscription_id UUID;
BEGIN
  -- Update user profile with plan information
  UPDATE profiles
  SET
    subscription_plan = p_plan_type,
    subscription_status = CASE 
      WHEN p_plan_type = 'free' THEN 'active'
      ELSE 'active'
    END,
    subscription_start_date = CASE
      WHEN p_plan_type != 'free' THEN CURRENT_DATE
      ELSE NULL
    END,
    subscription_end_date = CASE
      WHEN p_plan_type != 'free' THEN CURRENT_DATE + INTERVAL '1 year'
      ELSE NULL
    END,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Create sample subscriptions for testing
  IF p_plan_type = 'free' THEN
    -- Free user gets 2 sample subscriptions
    
    -- Get or create Netflix category
    SELECT id INTO v_category_id
    FROM categories
    WHERE name = 'Streaming' AND is_default = true
    LIMIT 1;

    INSERT INTO subscriptions (
      user_id,
      name,
      amount,
      currency,
      billing_cycle,
      category_id,
      status,
      next_billing_date,
      reminder_days_before,
      description
    ) VALUES (
      p_user_id,
      'Netflix',
      15.99,
      'USD',
      'monthly',
      v_category_id,
      'active',
      CURRENT_DATE + INTERVAL '15 days',
      3,
      'Standard plan with HD streaming'
    );

    -- Get or create Software category
    SELECT id INTO v_category_id
    FROM categories
    WHERE name = 'Software' AND is_default = true
    LIMIT 1;

    INSERT INTO subscriptions (
      user_id,
      name,
      amount,
      currency,
      billing_cycle,
      category_id,
      status,
      next_billing_date,
      reminder_days_before,
      description
    ) VALUES (
      p_user_id,
      'Spotify',
      9.99,
      'USD',
      'monthly',
      v_category_id,
      'active',
      CURRENT_DATE + INTERVAL '7 days',
      3,
      'Premium individual plan'
    );

  ELSE
    -- Premium user gets 5 sample subscriptions
    
    -- Streaming subscriptions
    SELECT id INTO v_category_id
    FROM categories
    WHERE name = 'Streaming' AND is_default = true
    LIMIT 1;

    INSERT INTO subscriptions (
      user_id, name, amount, currency, billing_cycle, category_id, status, next_billing_date, reminder_days_before, description
    ) VALUES 
    (p_user_id, 'Netflix', 15.99, 'USD', 'monthly', v_category_id, 'active', CURRENT_DATE + INTERVAL '15 days', 7, 'Premium plan with 4K streaming'),
    (p_user_id, 'Disney+', 10.99, 'USD', 'monthly', v_category_id, 'active', CURRENT_DATE + INTERVAL '20 days', 7, 'Standard plan'),
    (p_user_id, 'HBO Max', 14.99, 'USD', 'monthly', v_category_id, 'active', CURRENT_DATE + INTERVAL '10 days', 7, 'Ad-free plan');

    -- Software subscriptions
    SELECT id INTO v_category_id
    FROM categories
    WHERE name = 'Software' AND is_default = true
    LIMIT 1;

    INSERT INTO subscriptions (
      user_id, name, amount, currency, billing_cycle, category_id, status, next_billing_date, reminder_days_before, description
    ) VALUES 
    (p_user_id, 'Adobe Creative Cloud', 54.99, 'USD', 'monthly', v_category_id, 'active', CURRENT_DATE + INTERVAL '5 days', 7, 'All apps plan'),
    (p_user_id, 'GitHub Pro', 4.00, 'USD', 'monthly', v_category_id, 'active', CURRENT_DATE + INTERVAL '12 days', 7, 'Pro developer plan');

    -- Fitness subscription
    SELECT id INTO v_category_id
    FROM categories
    WHERE name = 'Fitness' AND is_default = true
    LIMIT 1;

    IF v_category_id IS NOT NULL THEN
      INSERT INTO subscriptions (
        user_id, name, amount, currency, billing_cycle, category_id, status, next_billing_date, reminder_days_before, description
      ) VALUES 
      (p_user_id, 'Peloton', 44.00, 'USD', 'monthly', v_category_id, 'active', CURRENT_DATE + INTERVAL '8 days', 7, 'All-access membership');
    END IF;

    -- Add a cancelled subscription for testing
    INSERT INTO subscriptions (
      user_id, name, amount, currency, billing_cycle, category_id, status, next_billing_date, reminder_days_before, description, cancelled_at
    ) VALUES 
    (p_user_id, 'YouTube Premium', 11.99, 'USD', 'monthly', v_category_id, 'cancelled', NULL, 3, 'Ad-free YouTube', CURRENT_DATE - INTERVAL '30 days');

  END IF;

  -- Create sample notifications
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    is_read
  ) VALUES 
  (p_user_id, 'Welcome to BeforeCharge!', 'Start by adding your first subscription to track your spending.', 'info', false),
  (p_user_id, 'Tip: Set Reminders', 'Don''t forget to set reminder days for your subscriptions to never miss a renewal.', 'info', false);

END;
$$;

-- Instructions for creating test users:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Create user with email: test.free@beforecharge.com, password: TestFree123!
-- 4. Copy the user ID
-- 5. Run: SELECT create_test_user_data('USER_ID_HERE', 'free');
-- 6. Repeat for premium user: test.premium@beforecharge.com, password: TestPremium123!
-- 7. Run: SELECT create_test_user_data('USER_ID_HERE', 'premium');

-- Add comment for documentation
COMMENT ON FUNCTION create_test_user_data IS 'Creates test subscription data for a user. Use after creating test users in Supabase Dashboard.';
