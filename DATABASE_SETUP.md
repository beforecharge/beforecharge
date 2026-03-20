# 🗄️ Database Setup Guide

## Quick Setup

### Option 1: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

### Option 2: Manual Setup via Dashboard
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order (see below)

---

## Migration Files (Run in Order)

### 1. Initial Schema
**File:** `supabase/migrations/20240101000000_initial_schema.sql`
**Purpose:** Creates base tables and structure

### 2. Initial Schema (Extended)
**File:** `supabase/migrations/20240101000001_initial_schema.sql`
**Purpose:** Additional tables and relationships

### 3. Fix User Profile Creation
**File:** `supabase/migrations/20240102000001_fix_user_profile_creation.sql`
**Purpose:** Fixes profile creation trigger

### 4. Fix Profile Creation Trigger
**File:** `supabase/migrations/20240103000001_fix_profile_creation_trigger.sql`
**Purpose:** Ensures profiles are created on signup

### 5. Billing and Plans
**File:** `supabase/migrations/20260308000001_billing_and_plans.sql`
**Purpose:** Adds subscription plans and billing tables

### 6. Extend Currency Enum
**File:** `supabase/migrations/20260308000002_extend_currency_enum.sql`
**Purpose:** Adds more currency options

### 7. Initial Schema (Latest)
**File:** `supabase/migrations/20260308171011_initial_schema.sql`
**Purpose:** Latest schema updates

### 8. Create Test Users Function ⭐ NEW
**File:** `supabase/migrations/20260318000001_create_test_users.sql`
**Purpose:** Adds function to create test user data

---

## Manual Migration Steps

If you prefer to run migrations manually:

### Step 1: Copy Migration Content
```bash
# View a migration file
cat supabase/migrations/20240101000000_initial_schema.sql
```

### Step 2: Run in Supabase Dashboard
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Paste the migration content
5. Click **Run**
6. Repeat for each migration file in order

---

## Verify Setup

### Check Tables Created
```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- `profiles`
- `subscriptions`
- `categories`
- `tags`
- `subscription_tags`
- `receipts`
- `notifications`
- `user_subscriptions` (billing)

### Check Functions Created
```sql
-- List all functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

Expected functions:
- `create_test_user_data`
- `get_upcoming_renewals`
- `get_monthly_spending`
- `get_category_spending`
- `calculate_annual_savings`

### Check Default Categories
```sql
-- View default categories
SELECT name, icon, color, is_default 
FROM categories 
WHERE is_default = true
ORDER BY name;
```

Should see 15+ categories like:
- Streaming
- Software
- Fitness
- Utilities
- Entertainment
- etc.

---

## Storage Setup

### Create Receipts Bucket
1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Name: `receipts`
4. Public: `true` (or configure policies)
5. Click **Create**

### Set Storage Policies
```sql
-- Allow authenticated users to upload receipts
CREATE POLICY "Users can upload their own receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own receipts
CREATE POLICY "Users can view their own receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own receipts
CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Authentication Setup

### Email/Password (Default)
Already configured - no additional setup needed.

### Google OAuth
1. Go to **Authentication** > **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

### Email Confirmation
For testing, you may want to disable email confirmation:
1. Go to **Authentication** > **Settings**
2. Scroll to **Email Auth**
3. Toggle **Enable email confirmations** OFF (for testing only)

---

## Row Level Security (RLS)

All tables should have RLS enabled. Verify with:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should show `rowsecurity = true`.

### Key RLS Policies

**Profiles:**
- Users can view their own profile
- Users can update their own profile

**Subscriptions:**
- Users can view their own subscriptions
- Users can create their own subscriptions
- Users can update their own subscriptions
- Users can delete their own subscriptions

**Categories:**
- Users can view default categories and their own
- Users can create their own categories
- Users can update their own categories
- Users can delete their own categories

**Notifications:**
- Users can view their own notifications
- Users can update their own notifications
- Users can delete their own notifications

---

## Test the Setup

### 1. Create a Test User Manually
```sql
-- This will be done via the app or Supabase Dashboard
-- Just verify the profile is created automatically
```

### 2. Check Profile Creation
```sql
-- After creating a user, check if profile exists
SELECT * FROM profiles WHERE email = 'test@example.com';
```

### 3. Test Subscription Creation
```sql
-- Insert a test subscription
INSERT INTO subscriptions (
  user_id,
  name,
  amount,
  currency,
  billing_cycle,
  status,
  next_billing_date
) VALUES (
  'your-user-id',
  'Test Subscription',
  9.99,
  'USD',
  'monthly',
  'active',
  CURRENT_DATE + INTERVAL '30 days'
);
```

### 4. Test Functions
```sql
-- Test upcoming renewals
SELECT * FROM get_upcoming_renewals('your-user-id', 30);

-- Test monthly spending
SELECT * FROM get_monthly_spending(
  'your-user-id',
  '2024-01-01',
  '2024-12-31'
);
```

---

## Troubleshooting

### Migration Failed
```bash
# Check migration status
supabase db diff

# Reset and try again (WARNING: This will delete all data)
supabase db reset

# Or fix specific migration and re-run
supabase db push
```

### RLS Blocking Queries
```sql
-- Temporarily disable RLS for testing (NOT for production)
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
```

### Function Not Found
```sql
-- Check if function exists
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'create_test_user_data';

-- If missing, re-run the migration that creates it
```

### Storage Bucket Not Found
1. Check bucket name in code matches dashboard
2. Verify bucket is created in Storage section
3. Check storage policies are set correctly

---

## Backup and Restore

### Backup Database
```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or from dashboard
# Go to Database > Backups > Create Backup
```

### Restore Database
```bash
# Using Supabase CLI
supabase db reset
psql -h your-db-host -U postgres -d postgres -f backup.sql
```

---

## Production Checklist

Before going to production:

- [ ] All migrations run successfully
- [ ] RLS enabled on all tables
- [ ] Storage bucket created and configured
- [ ] Storage policies set correctly
- [ ] Authentication providers configured
- [ ] Email templates customized
- [ ] Test user creation works
- [ ] All functions tested
- [ ] Backup strategy in place
- [ ] Monitoring enabled

---

## Support

If you encounter issues:

1. **Check Supabase Logs**
   - Dashboard > Logs > Database
   - Look for error messages

2. **Verify Environment Variables**
   - Check `.env.local` has correct values
   - Verify Supabase URL and keys

3. **Test Connection**
   ```bash
   # Test if you can connect
   supabase db ping
   ```

4. **Review Migration Files**
   - Ensure no syntax errors
   - Check for missing dependencies

5. **Consult Documentation**
   - Supabase docs: https://supabase.com/docs
   - PostgreSQL docs: https://www.postgresql.org/docs/

---

## Quick Reference

```bash
# Common Commands
supabase db push              # Run migrations
supabase db reset             # Reset database (WARNING: deletes data)
supabase db diff              # Show pending changes
supabase db dump              # Backup database
supabase migration new name   # Create new migration
supabase migration list       # List all migrations

# Check status
supabase status               # Show project status
supabase db ping              # Test connection

# Functions
supabase functions list       # List edge functions
supabase functions deploy     # Deploy functions
```

---

**Your database is now ready! 🎉**

Next step: Run `npm run create-test-users` to create test accounts.
