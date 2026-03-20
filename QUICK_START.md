# 🚀 BeforeCharge - Quick Start Guide

## 30-Second Setup

```bash
# 1. Install dependencies
npm install

# 2. Create test users
npm run create-test-users

# 3. Start the app
npm run dev
```

## Test Accounts

### Free Plan
- Email: `test.free@beforecharge.com`
- Password: `TestFree123!`

### Premium Plan
- Email: `test.premium@beforecharge.com`
- Password: `TestPremium123!`

## What's Included

✅ **2 Test Users** - One free, one premium
✅ **Sample Subscriptions** - Pre-populated data
✅ **Email Reminders** - Edge function ready
✅ **Clean Setup** - No Vite/Next.js conflicts
✅ **All Features Working** - Production ready

## Next Steps

1. **Deploy Edge Functions**
   ```bash
   supabase functions deploy send-reminders
   ```

2. **Setup Email Service**
   ```bash
   supabase secrets set RESEND_API_KEY=your_key
   ```

3. **Configure Google OAuth**
   - Add test users in Google Cloud Console
   - See `OAUTH_FIX_GUIDE.md` for details

4. **Deploy to Production**
   ```bash
   vercel deploy
   ```

## Need Help?

- 📖 Full setup: `SETUP_COMPLETE.md`
- 🔐 OAuth issues: `OAUTH_FIX_GUIDE.md`
- 📧 Gmail setup: `GMAIL_AUTO_FETCH.md`
- 📚 Main docs: `README.md`

## Common Issues

**"SUPABASE_SERVICE_ROLE_KEY not found"**
- Add it to your `.env.local` file
- Get it from Supabase Dashboard > Settings > API

**"Test users not created"**
- Run migrations first: `supabase db push`
- Check Supabase connection

**"OAuth not working"**
- Add test users in Google Cloud Console
- Check redirect URLs match

---

**That's it! You're ready to go! 🎉**
