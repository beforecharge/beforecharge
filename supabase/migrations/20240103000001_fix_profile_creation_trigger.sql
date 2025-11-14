-- Create a new migration to fix the profile creation trigger
-- This will ensure existing users get profiles created and new users get them automatically

-- First, create profiles for any existing users who don't have them
INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    avatar_url,
    default_currency,
    timezone,
    notification_preferences,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name',
    COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture'),
    'USD',
    'UTC',
    '{
        "email_reminders": true,
        "push_notifications": false,
        "reminder_days": [7, 3, 1],
        "trial_reminders": true,
        "price_change_alerts": true
    }'::jsonb,
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Update the handle_new_user function to include all required fields
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (
        id, 
        email, 
        full_name, 
        avatar_url,
        default_currency,
        timezone,
        notification_preferences,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        'USD',
        'UTC',
        '{
            "email_reminders": true,
            "push_notifications": false,
            "reminder_days": [7, 3, 1],
            "trial_reminders": true,
            "price_change_alerts": true
        }'::jsonb,
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();