# 🛠️ Scripts Directory

This directory contains utility scripts for BeforeCharge development and setup.

---

## Available Scripts

### create-test-users.ts

**Purpose:** Automatically creates test users with pre-populated subscription data.

**Usage:**
```bash
npm run create-test-users
```

**What it does:**
1. Creates two test user accounts (if they don't exist)
2. Sets up user profiles with plan information
3. Generates sample subscriptions
4. Creates sample notifications
5. Configures user preferences

**Test Users Created:**

#### Free Plan User
- **Email:** test.free@beforecharge.com
- **Password:** TestFree123!
- **Subscriptions:** 2 (Netflix, Spotify)
- **Plan:** Free tier
- **Features:** Basic features only

#### Premium Plan User
- **Email:** test.premium@beforecharge.com
- **Password:** TestPremium123!
- **Subscriptions:** 7 (Netflix, Disney+, HBO Max, Adobe, GitHub, Peloton, YouTube Premium)
- **Plan:** Premium tier
- **Features:** All features enabled

**Requirements:**
- Node.js installed
- Environment variables set:
  - `VITE_SUPABASE_URL` or `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Database migrations run (`supabase db push`)

**Environment Variables:**
```env
# In .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Output:**
```
🚀 BeforeCharge Test User Creation Script
==========================================

📝 Creating test user: test.free@beforecharge.com
   ✅ User created with ID: xxx-xxx-xxx
   ✅ Profile created/updated
   ✅ Test subscriptions and data created

   🎉 Test user ready!
   📧 Email: test.free@beforecharge.com
   🔑 Password: TestFree123!
   📦 Plan: FREE

📝 Creating test user: test.premium@beforecharge.com
   ✅ User created with ID: xxx-xxx-xxx
   ✅ Profile created/updated
   ✅ Test subscriptions and data created

   🎉 Test user ready!
   📧 Email: test.premium@beforecharge.com
   🔑 Password: TestPremium123!
   📦 Plan: PREMIUM

📊 Summary
==========
✅ test.free@beforecharge.com
✅ test.premium@beforecharge.com

2/2 users created successfully

🎯 Next Steps:
1. Visit your app login page
2. Sign in with one of the test accounts above
3. Explore the pre-populated subscriptions and features
```

**Error Handling:**
- Checks for existing users (won't duplicate)
- Validates environment variables
- Provides clear error messages
- Exits with appropriate status codes

**Troubleshooting:**

**"Missing required environment variables"**
```bash
# Add to .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**"Test data error: function create_test_user_data does not exist"**
```bash
# Run migrations first
supabase db push
```

**"User already exists"**
- Script will use existing user and update their data
- This is normal and not an error

**"Profile error"**
- Check if profiles table exists
- Verify RLS policies allow inserts
- Check database connection

---

## Adding New Scripts

### Template for New Scripts

```typescript
/**
 * Script description
 * Run with: npm run script-name
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('🚀 Script Name');
  console.log('='.repeat(40));
  
  try {
    // Your script logic here
    
    console.log('✅ Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
```

### Adding to package.json

```json
{
  "scripts": {
    "your-script": "tsx scripts/your-script.ts"
  }
}
```

---

## Script Development

### Running Scripts Locally

```bash
# Run with tsx directly
npx tsx scripts/create-test-users.ts

# Or use npm script
npm run create-test-users
```

### Debugging Scripts

```bash
# Add debug output
DEBUG=* npm run create-test-users

# Or use Node.js inspector
node --inspect node_modules/.bin/tsx scripts/create-test-users.ts
```

### Testing Scripts

```bash
# Test with dry-run flag (if implemented)
npm run create-test-users -- --dry-run

# Test with specific user
npm run create-test-users -- --email test@example.com
```

---

## Best Practices

### Environment Variables
- Always check for required variables
- Provide clear error messages
- Use fallbacks when appropriate
- Never commit secrets

### Error Handling
- Use try-catch blocks
- Provide helpful error messages
- Exit with appropriate codes (0 = success, 1 = error)
- Log errors to console

### User Feedback
- Show progress indicators
- Use emojis for visual feedback
- Provide summary at the end
- Include next steps

### Code Quality
- Add TypeScript types
- Comment complex logic
- Keep functions small
- Use async/await

---

## Future Scripts

### Planned Scripts

**cleanup-test-data.ts**
- Remove all test users and their data
- Usage: `npm run cleanup-test-data`

**seed-categories.ts**
- Add default categories to database
- Usage: `npm run seed-categories`

**migrate-data.ts**
- Migrate data between environments
- Usage: `npm run migrate-data`

**backup-database.ts**
- Create database backup
- Usage: `npm run backup-database`

**generate-reports.ts**
- Generate usage reports
- Usage: `npm run generate-reports`

---

## Dependencies

### Required Packages
- `@supabase/supabase-js` - Supabase client
- `tsx` - TypeScript execution

### Installation
```bash
npm install @supabase/supabase-js
npm install --save-dev tsx
```

---

## Security Notes

### Service Role Key
- **Never commit** the service role key
- Keep it in `.env.local` (gitignored)
- Use different keys for dev/prod
- Rotate keys periodically

### Script Permissions
- Scripts have full database access
- Be careful with delete operations
- Test in development first
- Always backup before running in production

### User Data
- Test users use fake data
- Passwords are for testing only
- Don't use real email addresses
- Clean up test data regularly

---

## Support

### Documentation
- Main setup: [../SETUP_COMPLETE.md](../SETUP_COMPLETE.md)
- Quick start: [../QUICK_START.md](../QUICK_START.md)
- Database setup: [../DATABASE_SETUP.md](../DATABASE_SETUP.md)

### Common Issues
- Check environment variables
- Verify database connection
- Run migrations first
- Check Supabase dashboard for errors

### Getting Help
1. Check script output for errors
2. Review environment variables
3. Check Supabase logs
4. Verify database schema

---

## Contributing

### Adding New Scripts
1. Create script in `scripts/` directory
2. Add npm script to `package.json`
3. Document in this README
4. Test thoroughly
5. Submit pull request

### Script Guidelines
- Use TypeScript
- Add error handling
- Provide user feedback
- Document usage
- Include examples

---

**Happy scripting! 🚀**
