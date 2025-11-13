-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types/enums
CREATE TYPE billing_cycle AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'semi-annual',
  'annual'
);

CREATE TYPE currency AS ENUM (
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'CHF',
  'SEK',
  'NOK',
  'DKK'
);

CREATE TYPE notification_type AS ENUM (
  'renewal',
  'trial_ending',
  'price_change',
  'cancellation'
);

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  default_currency currency DEFAULT 'USD' NOT NULL,
  timezone TEXT DEFAULT 'UTC' NOT NULL,
  notification_preferences JSONB DEFAULT '{
    "email_reminders": true,
    "push_notifications": false,
    "reminder_days": [7, 3, 1],
    "trial_reminders": true,
    "price_change_alerts": true
  }' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure unique category names per user (or global for defaults)
  UNIQUE(name, user_id),
  -- Default categories have no user_id
  CHECK ((is_default = TRUE AND user_id IS NULL) OR (is_default = FALSE AND user_id IS NOT NULL))
);

-- Create tags table
CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(name, user_id)
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
  currency currency DEFAULT 'USD' NOT NULL,
  billing_cycle billing_cycle NOT NULL,
  renewal_date DATE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
  tags TEXT[] DEFAULT '{}' NOT NULL,
  receipt_url TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  last_used_date DATE,
  trial_end_date DATE,
  website_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure renewal date is in the future for active subscriptions
  CHECK (NOT is_active OR renewal_date >= CURRENT_DATE)
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create receipts table
CREATE TABLE receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create reminder_jobs table
CREATE TABLE reminder_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reminder_date DATE NOT NULL,
  notification_type notification_type NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(subscription_id, reminder_date, notification_type)
);

-- Create indexes for better performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_renewal_date ON subscriptions(renewal_date);
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_category_id ON subscriptions(category_id);
CREATE INDEX idx_subscriptions_tags ON subscriptions USING GIN(tags);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_is_default ON categories(is_default);

CREATE INDEX idx_tags_user_id ON tags(user_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_subscription_id ON notifications(subscription_id);

CREATE INDEX idx_receipts_subscription_id ON receipts(subscription_id);

CREATE INDEX idx_reminder_jobs_user_id ON reminder_jobs(user_id);
CREATE INDEX idx_reminder_jobs_reminder_date ON reminder_jobs(reminder_date);
CREATE INDEX idx_reminder_jobs_is_sent ON reminder_jobs(is_sent);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles: Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories: Users can see default categories and their own categories
CREATE POLICY "Users can view categories" ON categories
    FOR SELECT USING (is_default = TRUE OR user_id = auth.uid());

CREATE POLICY "Users can create own categories" ON categories
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (user_id = auth.uid());

-- Tags: Users can only access their own tags
CREATE POLICY "Users can manage own tags" ON tags
    USING (user_id = auth.uid());

-- Subscriptions: Users can only access their own subscriptions
CREATE POLICY "Users can manage own subscriptions" ON subscriptions
    USING (user_id = auth.uid());

-- Notifications: Users can only access their own notifications
CREATE POLICY "Users can manage own notifications" ON notifications
    USING (user_id = auth.uid());

-- Receipts: Users can only access receipts for their own subscriptions
CREATE POLICY "Users can manage own receipts" ON receipts
    USING (subscription_id IN (
        SELECT id FROM subscriptions WHERE user_id = auth.uid()
    ));

-- Reminder jobs: Users can only access their own reminder jobs
CREATE POLICY "Users can manage own reminder jobs" ON reminder_jobs
    USING (user_id = auth.uid());

-- Insert default categories
INSERT INTO categories (name, icon, color, is_default) VALUES
  ('Streaming', 'Play', '#ef4444', TRUE),
  ('Software', 'Code', '#3b82f6', TRUE),
  ('Fitness', 'Dumbbell', '#10b981', TRUE),
  ('Music', 'Music', '#8b5cf6', TRUE),
  ('News', 'Newspaper', '#f59e0b', TRUE),
  ('Gaming', 'Gamepad2', '#06b6d4', TRUE),
  ('Education', 'GraduationCap', '#84cc16', TRUE),
  ('Business', 'Building', '#6366f1', TRUE),
  ('Utilities', 'Zap', '#f97316', TRUE),
  ('Food & Drink', 'Coffee', '#ec4899', TRUE),
  ('Transportation', 'Car', '#14b8a6', TRUE),
  ('Shopping', 'ShoppingBag', '#f43f5e', TRUE),
  ('Finance', 'CreditCard', '#22c55e', TRUE),
  ('Communication', 'MessageCircle', '#a855f7', TRUE),
  ('Storage', 'HardDrive', '#64748b', TRUE);

-- Create database functions for analytics

-- Function to get monthly spending
CREATE OR REPLACE FUNCTION get_monthly_spending(
    user_id UUID,
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    month TEXT,
    total_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TO_CHAR(DATE_TRUNC('month', generate_series)::DATE, 'YYYY-MM') as month,
        COALESCE(SUM(
            CASE s.billing_cycle
                WHEN 'daily' THEN s.cost * 30.44 -- Average days per month
                WHEN 'weekly' THEN s.cost * 4.33 -- Average weeks per month
                WHEN 'monthly' THEN s.cost
                WHEN 'quarterly' THEN s.cost / 3
                WHEN 'semi-annual' THEN s.cost / 6
                WHEN 'annual' THEN s.cost / 12
            END
        ), 0) as total_amount
    FROM generate_series(start_date::DATE, end_date::DATE, '1 month'::interval) generate_series
    LEFT JOIN subscriptions s ON s.user_id = get_monthly_spending.user_id
        AND s.is_active = TRUE
        AND s.created_at <= generate_series + interval '1 month'
        AND (s.updated_at >= generate_series OR s.is_active = TRUE)
    GROUP BY DATE_TRUNC('month', generate_series)
    ORDER BY DATE_TRUNC('month', generate_series);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get category spending
CREATE OR REPLACE FUNCTION get_category_spending(user_id UUID)
RETURNS TABLE (
    category_name TEXT,
    total_amount DECIMAL,
    subscription_count BIGINT,
    color TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.name as category_name,
        COALESCE(SUM(
            CASE s.billing_cycle
                WHEN 'daily' THEN s.cost * 30.44
                WHEN 'weekly' THEN s.cost * 4.33
                WHEN 'monthly' THEN s.cost
                WHEN 'quarterly' THEN s.cost / 3
                WHEN 'semi-annual' THEN s.cost / 6
                WHEN 'annual' THEN s.cost / 12
            END
        ), 0) as total_amount,
        COUNT(s.id) as subscription_count,
        c.color
    FROM categories c
    LEFT JOIN subscriptions s ON s.category_id = c.id
        AND s.user_id = get_category_spending.user_id
        AND s.is_active = TRUE
    WHERE c.is_default = TRUE OR c.user_id = get_category_spending.user_id
    GROUP BY c.id, c.name, c.color
    HAVING COUNT(s.id) > 0
    ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming renewals
CREATE OR REPLACE FUNCTION get_upcoming_renewals(
    user_id UUID,
    days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
    subscription_id UUID,
    name TEXT,
    cost DECIMAL,
    currency currency,
    renewal_date DATE,
    days_until_renewal INTEGER,
    category_name TEXT,
    category_color TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id as subscription_id,
        s.name,
        s.cost,
        s.currency,
        s.renewal_date,
        (s.renewal_date - CURRENT_DATE) as days_until_renewal,
        c.name as category_name,
        c.color as category_color
    FROM subscriptions s
    JOIN categories c ON s.category_id = c.id
    WHERE s.user_id = get_upcoming_renewals.user_id
        AND s.is_active = TRUE
        AND s.renewal_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + days_ahead)
    ORDER BY s.renewal_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unused subscriptions
CREATE OR REPLACE FUNCTION get_unused_subscriptions(
    user_id UUID,
    days_unused INTEGER DEFAULT 30
)
RETURNS TABLE (
    subscription_id UUID,
    name TEXT,
    cost DECIMAL,
    currency currency,
    last_used_date DATE,
    days_since_used INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id as subscription_id,
        s.name,
        s.cost,
        s.currency,
        s.last_used_date,
        (CURRENT_DATE - s.last_used_date) as days_since_used
    FROM subscriptions s
    WHERE s.user_id = get_unused_subscriptions.user_id
        AND s.is_active = TRUE
        AND s.last_used_date IS NOT NULL
        AND s.last_used_date < (CURRENT_DATE - days_unused)
    ORDER BY s.last_used_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate annual savings opportunities
CREATE OR REPLACE FUNCTION calculate_annual_savings(user_id UUID)
RETURNS TABLE (
    subscription_id UUID,
    name TEXT,
    monthly_cost DECIMAL,
    annual_cost DECIMAL,
    potential_savings DECIMAL,
    savings_percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id as subscription_id,
        s.name,
        CASE s.billing_cycle
            WHEN 'daily' THEN s.cost * 30.44
            WHEN 'weekly' THEN s.cost * 4.33
            WHEN 'monthly' THEN s.cost
            WHEN 'quarterly' THEN s.cost / 3
            WHEN 'semi-annual' THEN s.cost / 6
            WHEN 'annual' THEN s.cost / 12
        END as monthly_cost,
        s.cost as annual_cost,
        -- Assume 15% savings for annual vs monthly (common discount)
        CASE s.billing_cycle
            WHEN 'monthly' THEN (s.cost * 12) * 0.15
            ELSE 0
        END as potential_savings,
        CASE s.billing_cycle
            WHEN 'monthly' THEN 15.00
            ELSE 0.00
        END as savings_percentage
    FROM subscriptions s
    WHERE s.user_id = calculate_annual_savings.user_id
        AND s.is_active = TRUE
        AND s.billing_cycle = 'monthly'
        AND s.cost > 10 -- Only show for subscriptions > $10/month
    ORDER BY potential_savings DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to create reminder jobs when subscriptions are created/updated
CREATE OR REPLACE FUNCTION create_reminder_jobs()
RETURNS TRIGGER AS $$
DECLARE
    reminder_days INTEGER[] := '{1, 3, 7}';
    reminder_day INTEGER;
    reminder_date DATE;
BEGIN
    -- Delete existing reminder jobs for this subscription
    DELETE FROM reminder_jobs WHERE subscription_id = NEW.id;

    -- Only create reminders for active subscriptions
    IF NEW.is_active THEN
        -- Create reminder jobs for each reminder day
        FOREACH reminder_day IN ARRAY reminder_days
        LOOP
            reminder_date := NEW.renewal_date - reminder_day;

            -- Only create reminder if the date is in the future
            IF reminder_date >= CURRENT_DATE THEN
                INSERT INTO reminder_jobs (
                    subscription_id,
                    user_id,
                    reminder_date,
                    notification_type
                ) VALUES (
                    NEW.id,
                    NEW.user_id,
                    reminder_date,
                    'renewal'
                );
            END IF;
        END LOOP;

        -- Create trial ending reminder if trial_end_date exists
        IF NEW.trial_end_date IS NOT NULL AND NEW.trial_end_date > CURRENT_DATE THEN
            INSERT INTO reminder_jobs (
                subscription_id,
                user_id,
                reminder_date,
                notification_type
            ) VALUES (
                NEW.id,
                NEW.user_id,
                NEW.trial_end_date - 1,
                'trial_ending'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create reminder jobs
CREATE TRIGGER create_subscription_reminders
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION create_reminder_jobs();
