# OAuth Configuration for myrenewly.com

## EXACT CONFIGURATION NEEDED

### 1. Supabase Dashboard Settings
**URL:** https://supabase.com/dashboard
**Path:** Authentication → URL Configuration

**Site URL:**
```
https://myrenewly.com
```

**Redirect URLs (add both):**
```
https://myrenewly.com/auth/callback
http://localhost:3000/auth/callback
```

### 2. Google Cloud Console Settings
**URL:** https://console.cloud.google.com
**Path:** APIs & Services → Credentials → OAuth 2.0 Client ID

**Authorized redirect URIs (add both):**
```
https://cbsjvqhrlojzhkotqlb.supabase.co/auth/v1/callback
https://myrenewly.com/auth/callback
```

### 3. Code Changes Applied ✅
- Updated redirect URL logic for myrenewly.com
- Added better logging for debugging
- Forced correct production domain usage

## Testing Steps
1. Update Supabase settings as above
2. Update Google OAuth settings as above  
3. Deploy the latest code changes
4. Test OAuth on https://myrenewly.com
5. Check browser console for logs

## Expected Behavior
- Development: redirects to localhost:3000/auth/callback
- Production: redirects to https://myrenewly.com/auth/callback