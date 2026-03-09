-- Clean up existing tables and triggers from failed attempts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.receipts CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.reminder_jobs CASCADE;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users profile table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    default_currency TEXT DEFAULT 'USD',
    timezone TEXT DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{"email_reminders": true, "push_notifications": false, "reminder_days": [3, 7], "trial_reminders": true, "price_change_alerts": true}'::jsonb,
    plan_type TEXT DEFAULT 'free',
    plan_expires_at TIMESTAMPTZ,
    plan_provider TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cost DECIMAL NOT NULL,
    currency TEXT NOT NULL,
    billing_cycle TEXT NOT NULL,
    renewal_date TIMESTAMPTZ NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    receipt_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_used_date TIMESTAMPTZ,
    trial_end_date TIMESTAMPTZ,
    website_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipts
CREATE TABLE public.receipts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags
CREATE TABLE public.tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminder Jobs
CREATE TABLE public.reminder_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_date TIMESTAMPTZ NOT NULL,
    notification_type TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see and update their own profile
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Categories: everyone can read default categories, users can manage their own custom ones (if added)
CREATE POLICY "Categories are viewable by everyone" 
    ON public.categories FOR SELECT 
    USING (is_default = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" 
    ON public.categories FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" 
    ON public.categories FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" 
    ON public.categories FOR DELETE 
    USING (auth.uid() = user_id);

-- Subscriptions: users can only manage their own
CREATE POLICY "Users can view own subscriptions" 
    ON public.subscriptions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" 
    ON public.subscriptions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" 
    ON public.subscriptions FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions" 
    ON public.subscriptions FOR DELETE 
    USING (auth.uid() = user_id);

-- Receipts: users can only manage their own
CREATE POLICY "Users can view own receipts" 
    ON public.receipts FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.subscriptions WHERE id = public.receipts.subscription_id AND user_id = auth.uid()));

CREATE POLICY "Users can insert own receipts" 
    ON public.receipts FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.subscriptions WHERE id = public.receipts.subscription_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete own receipts" 
    ON public.receipts FOR DELETE 
    USING (EXISTS (SELECT 1 FROM public.subscriptions WHERE id = public.receipts.subscription_id AND user_id = auth.uid()));

-- Tags: users can only manage their own
CREATE POLICY "Users can view own tags" 
    ON public.tags FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" 
    ON public.tags FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" 
    ON public.tags FOR DELETE 
    USING (auth.uid() = user_id);

-- Notifications: users can only manage their own
CREATE POLICY "Users can view own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
    ON public.notifications FOR DELETE 
    USING (auth.uid() = user_id);

-- Define a trigger to automatically create a profile for new auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    -- We assume default_currency will be set correctly by client during their first login/upsert
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'full_name', 
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Default categories data seed
INSERT INTO public.categories (name, icon, color, is_default) VALUES
('Streaming', 'Play', '#ef4444', true),
('Software', 'Code', '#3b82f6', true),
('Fitness', 'Dumbbell', '#10b981', true),
('Music', 'Music', '#8b5cf6', true),
('News', 'Newspaper', '#f59e0b', true),
('Gaming', 'Gamepad2', '#06b6d4', true),
('Education', 'GraduationCap', '#84cc16', true),
('Business', 'Building', '#6366f1', true),
('Utilities', 'Zap', '#f97316', true),
('Food & Drink', 'Coffee', '#ec4899', true),
('Transportation', 'Car', '#14b8a6', true),
('Shopping', 'ShoppingBag', '#f43f5e', true),
('Finance', 'CreditCard', '#22c55e', true),
('Communication', 'MessageCircle', '#a855f7', true),
('Storage', 'HardDrive', '#64748b', true)
ON CONFLICT DO NOTHING;
