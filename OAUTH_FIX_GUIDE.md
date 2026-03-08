# 🔧 Fix Google OAuth "Unverified App" Issue

## Current Problem
Your app shows "Access blocked: This app's request is invalid" or "This app isn't verified" because:
1. App name in Google Cloud Console doesn't match "BeforeCharge"
2. OAuth consent screen is incomplete
3. Gmail scope requires verification for production use

## ✅ Immediate Fix (5 minutes)

### Step 1: Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: `cbsjvqhrloijzhcotqlb`
3. Navigate to **"APIs & Services" → "OAuth consent screen"**

### Step 2: Update App Information
```
App name: BeforeCharge
User support email: mehtasparsh777@gmail.com
Developer contact information: mehtasparsh777@gmail.com
```

### Step 3: Add Test Users
1. Scroll down to **"Test users"** section
2. Click **"Add users"**
3. Add: `mehtasparsh777@gmail.com`
4. Add any other emails that need to test the app
5. Click **"Save"**

### Step 4: Update App Domain (if required)
```
Application home page: https://cbsjvqhrloijzhcotqlb.supabase.co
Privacy policy link: https://cbsjvqhrloijzhcotqlb.supabase.co/privacy
Terms of service link: https://cbsjvqhrloijzhcotqlb.supabase.co/terms
```

## 🚀 Production Fix (For Public Release)

### Option 1: Complete Google Verification
1. **Fill out OAuth consent screen completely**:
   - App name: BeforeCharge
   - App logo (120x120px)
   - App description: "BeforeCharge helps users track and manage subscription services by automatically detecting subscriptions from Gmail emails."
   - Privacy policy URL
   - Terms of service URL

2. **Submit for verification**:
   - Process takes 4-6 weeks
   - Google will review your app
   - May require additional documentation

### Option 2: Reduce Scopes (Recommended)
Remove Gmail scope and use alternative methods:

```javascript
// Current scopes (requires verification)
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly', // ❌ Sensitive scope
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// Alternative scopes (no verification needed)
const BASIC_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];
```

## 🔄 Alternative Auto-Fetch Methods

### 1. Email Forwarding
- Users forward subscription emails to a dedicated address
- Parse emails server-side
- No Gmail API needed

### 2. Receipt Upload
- Users upload screenshots/PDFs of receipts
- Use OCR to extract subscription info
- More manual but no OAuth issues

### 3. Bank Integration
- Connect to banking APIs (Plaid, Yodlee)
- Detect recurring transactions
- More comprehensive than email parsing

## 📋 Current App Status

✅ **Fixed Issues:**
- App name changed to "BeforeCharge" throughout codebase
- Privacy policy and Terms of Service pages created
- Routes added for `/privacy` and `/terms`
- HTML meta tags updated

⏳ **Remaining Tasks:**
- Update Google Cloud Console OAuth consent screen
- Add test users for immediate access
- Choose long-term strategy (verification vs. alternative methods)

## 🎯 Recommended Approach

**For Development/Testing:**
1. Add test users immediately (5 minutes)
2. Continue development with Gmail auto-fetch

**For Production:**
1. **Phase 1**: Launch without Gmail auto-fetch
   - Manual subscription entry
   - Receipt upload feature
   - Build user base

2. **Phase 2**: Add Gmail integration
   - Complete Google verification process
   - Launch as premium feature
   - Market as "AI-powered auto-detection"

## 📞 Support

If you encounter issues:
1. Check Google Cloud Console error messages
2. Verify all OAuth consent screen fields are filled
3. Ensure test users are added correctly
4. Contact Google Cloud Support if verification is rejected

## 🔗 Useful Links

- [Google OAuth Verification Guide](https://support.google.com/cloud/answer/9110914)
- [OAuth Consent Screen Setup](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)