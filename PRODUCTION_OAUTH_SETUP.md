# Production OAuth Setup

## Problem
After Google login on production, users are redirected to `http://localhost:3000/?code=...` instead of your production domain.

## Root Cause
Your Supabase "Site URL" is set to `http://localhost:3000` instead of your production URL.

## Solution

### 1. Update Supabase Site URL

Go to your Supabase Dashboard:
1. Navigate to: https://supabase.com/dashboard/project/sejeftbaozzniaxqlowd/auth/url-configuration
2. Find **Site URL** setting
3. Change from: `http://localhost:3000`
4. Change to: `https://beforecharge.com` (or your actual production domain)
5. Click **Save**

### 2. Configure Redirect URLs

In the same page, under **Redirect URLs**, add:
```
https://beforecharge.com/**
http://localhost:3000/**
https://sejeftbaozzniaxqlowd.supabase.co/**
```

This allows redirects to both production and local development.

### 3. Update Google OAuth Console

Go to Google Cloud Console:
1. Navigate to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, add:
   ```
   https://beforecharge.com
   https://sejeftbaozzniaxqlowd.supabase.co
   http://localhost:3000
   ```
4. Under **Authorized redirect URIs**, ensure you have:
   ```
   https://sejeftbaozzniaxqlowd.supabase.co/auth/v1/callback
   ```
5. Click **Save**

### 4. Set Production Environment Variables

Make sure your production deployment has:
```bash
VITE_APP_URL=https://beforecharge.com
NEXT_PUBLIC_SITE_URL=https://beforecharge.com
```

### 5. Test Both Environments

**Production:**
1. Go to `https://beforecharge.com`
2. Click "Sign in with Google"
3. Should redirect back to `https://beforecharge.com/?code=...`
4. Supabase auto-detects code and signs you in

**Development:**
1. Go to `http://localhost:3000`
2. Click "Sign in with Google"
3. Should redirect back to `http://localhost:3000/?code=...`
4. Supabase auto-detects code and signs you in

## How It Works

1. User clicks "Sign in with Google"
2. Code uses `window.location.origin` to determine redirect URL
3. Google authenticates and redirects to Supabase callback
4. Supabase redirects to the **Site URL** you configured (with the OAuth code)
5. Your app's Supabase client detects the code (`detectSessionInUrl: true`)
6. Supabase exchanges code for session automatically
7. User is authenticated

## Common Issues

### Still redirecting to localhost from production
- **Cause**: Site URL not updated in Supabase
- **Fix**: Update Site URL to production domain

### "redirect_uri_mismatch" error
- **Cause**: Redirect URI not in Google Console
- **Fix**: Add Supabase callback URL to authorized redirect URIs

### Works in dev but not production
- **Cause**: Production domain not in Supabase redirect URLs
- **Fix**: Add production domain to allowed redirect URLs

### "Invalid redirect URL" error
- **Cause**: Domain not in Supabase allowed list
- **Fix**: Add `https://beforecharge.com/**` to redirect URLs

## Deployment Checklist

- [ ] Supabase Site URL set to production domain
- [ ] Production domain added to Supabase redirect URLs
- [ ] Supabase callback URL added to Google Console
- [ ] Production environment variables set
- [ ] Test OAuth flow on production
- [ ] Test OAuth flow on localhost still works
- [ ] Verify session persists after redirect
- [ ] Check browser console for errors

## Environment-Specific Behavior

The app automatically adapts to the environment:
- Uses `window.location.origin` for redirect URL
- Works on any domain without code changes
- Supabase Site URL determines the default redirect
- Both production and development can work simultaneously
