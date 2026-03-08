# Google OAuth Setup for BeforeCharge

## OAuth Consent Screen Configuration

### App Information
- **App name**: `BeforeCharge`
- **User support email**: `mehtasparsh777@gmail.com`
- **App logo**: Upload a 120x120px logo (optional but recommended)
- **App domain**: `https://cbsjvqhrloijzhcotqlb.supabase.co`
- **Authorized domains**: 
  - `supabase.co`
  - `localhost` (for development)

### App Description
```
BeforeCharge helps you track and manage all your subscription services in one place. 
We automatically detect subscriptions from your Gmail to help you stay on top of 
your recurring payments and avoid unwanted charges.
```

### Contact Information
- **Developer contact information**: `mehtasparsh777@gmail.com`

### Privacy Policy URL
Create a simple privacy policy and host it. For now, you can use:
`https://cbsjvqhrloijzhcotqlb.supabase.co/privacy`

### Terms of Service URL
Create terms of service and host it:
`https://cbsjvqhrloijzhcotqlb.supabase.co/terms`

## Required Scopes

### Non-sensitive scopes (no verification needed):
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

### Sensitive scopes (requires verification):
- `https://www.googleapis.com/auth/gmail.readonly`

## Test Users (Immediate Fix)

Add these test users to bypass verification during development:
- `mehtasparsh777@gmail.com`
- Add any other email addresses that need to test the app

## Verification Process (Production)

For production use, you'll need to:

1. **Complete App Verification**:
   - Provide detailed app description
   - Upload app screenshots
   - Explain why you need Gmail access
   - Provide privacy policy and terms of service

2. **Security Assessment**:
   - Google will review your app's security practices
   - May require security questionnaire
   - Process can take 4-6 weeks

3. **Alternative Approach**:
   - Consider using less sensitive scopes
   - Implement manual subscription entry as primary method
   - Use Gmail auto-fetch as optional premium feature

## Quick Fix for Development

1. **Add yourself as test user**:
   - Go to OAuth consent screen
   - Scroll to "Test users" section
   - Add `mehtasparsh777@gmail.com`
   - Save changes

2. **Update Supabase Auth Settings**:
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add your Google Client ID and Secret
   - Set redirect URL: `https://cbsjvqhrloijzhcotqlb.supabase.co/auth/v1/callback`

## Scopes Configuration

Current scopes in your app:
```javascript
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];
```

## Error Messages and Solutions

### "Access blocked: This app's request is invalid"
- **Cause**: OAuth consent screen not properly configured
- **Solution**: Complete all required fields in consent screen

### "This app isn't verified"
- **Cause**: App requesting sensitive scopes without verification
- **Solution**: Add test users or complete verification process

### "redirect_uri_mismatch"
- **Cause**: Redirect URI doesn't match configured URIs
- **Solution**: Add correct Supabase callback URL to authorized redirect URIs