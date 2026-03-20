# Send Reminders Edge Function

## Overview
This Supabase Edge Function sends email reminders to users about upcoming subscription renewals and trial expirations.

## Features
- ✅ Sends email reminders based on user preferences
- ✅ Creates in-app notifications
- ✅ Supports configurable reminder days (1, 3, 7, 14, 30 days before)
- ✅ Trial expiration alerts
- ✅ Respects user notification preferences
- ✅ Uses Resend API for reliable email delivery

## Setup

### 1. Deploy the Function
```bash
supabase functions deploy send-reminders
```

### 2. Set Environment Variables
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set APP_URL=https://your-app-url.com
```

### 3. Test the Function
```bash
# Manual test
supabase functions invoke send-reminders

# Or via HTTP
curl -X POST https://your-project.supabase.co/functions/v1/send-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Automated Scheduling

### Option 1: Supabase Cron (Recommended)
```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily at 9 AM
SELECT cron.schedule(
  'send-daily-reminders',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-reminders',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

### Option 2: External Cron Service
Use services like:
- [Cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- GitHub Actions
- Vercel Cron Jobs

Example GitHub Action:
```yaml
name: Send Reminders
on:
  schedule:
    - cron: '0 9 * * *' # Daily at 9 AM UTC
jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Function
        run: |
          curl -X POST ${{ secrets.SUPABASE_FUNCTION_URL }} \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

## Email Provider Setup

### Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain or use their test domain
3. Get your API key
4. Set the secret: `supabase secrets set RESEND_API_KEY=re_xxxxx`

### Alternative Providers
You can modify the function to use:
- SendGrid
- Mailgun
- AWS SES
- Postmark

## Response Format

### Success Response
```json
{
  "success": true,
  "reminders_sent": 5,
  "results": [
    {
      "success": true,
      "subscription": "Netflix",
      "user": "user@example.com"
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Reminder Logic

### When Reminders Are Sent
- Subscription renewal date matches user's `reminder_days_before` setting
- Trial expiration is 1 day away
- User has `email_reminders` enabled in notification preferences
- Subscription status is `active`

### Email Content
- **Subject**: "Renewal Reminder: [Subscription Name]"
- **Body**: Includes subscription name, amount, currency, renewal date
- **CTA**: Link to manage subscriptions

## Monitoring

### View Logs
```bash
supabase functions logs send-reminders --tail
```

### Check Function Status
```bash
supabase functions list
```

### Debug Issues
1. Check function logs for errors
2. Verify environment variables are set
3. Test email API credentials
4. Check database for active subscriptions
5. Verify user notification preferences

## Database Requirements

### Required Tables
- `subscriptions` - Must have `next_billing_date`, `reminder_days_before`
- `profiles` - Must have `notification_preferences` JSONB field
- `notifications` - For in-app notifications

### Required Fields
```sql
-- subscriptions table
next_billing_date DATE
reminder_days_before INTEGER DEFAULT 3
status TEXT DEFAULT 'active'
is_trial BOOLEAN DEFAULT false

-- profiles table
notification_preferences JSONB DEFAULT '{"email_reminders": true}'
```

## Cost Estimation

### Resend Pricing
- Free tier: 3,000 emails/month
- Pro: $20/month for 50,000 emails

### Supabase Edge Functions
- Free tier: 500,000 invocations/month
- Pro: 2,000,000 invocations/month

### Example Costs
- 1,000 users with 5 subscriptions each = 5,000 subscriptions
- Average 2 reminders per month per subscription = 10,000 emails/month
- Cost: Free tier covers this easily

## Security

### Best Practices
- ✅ Use service role key for database access
- ✅ Validate user preferences before sending
- ✅ Rate limit email sending
- ✅ Log all email attempts
- ✅ Handle errors gracefully
- ✅ Don't expose sensitive data in logs

### Environment Variables
Never commit these to version control:
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_URL`

## Customization

### Change Email Template
Edit the `sendReminderEmail` function in `index.ts`:
```typescript
const emailBody = `
  <h2>Your Custom Template</h2>
  <p>Hi ${user.full_name},</p>
  <!-- Your custom HTML here -->
`;
```

### Add More Notification Types
Extend the function to handle:
- Price change alerts
- Unused subscription warnings
- Annual savings reports
- Spending limit alerts

### Modify Reminder Logic
Change when reminders are sent:
```typescript
// Current: exact match
if (daysUntilRenewal === reminderDays)

// Alternative: range
if (daysUntilRenewal <= reminderDays && daysUntilRenewal > 0)
```

## Troubleshooting

### No Emails Sent
- Check if `RESEND_API_KEY` is set
- Verify subscriptions have `next_billing_date`
- Ensure users have `email_reminders: true`
- Check function logs for errors

### Emails Going to Spam
- Verify your domain with Resend
- Add SPF and DKIM records
- Use a professional "from" address
- Include unsubscribe link

### Function Timeout
- Reduce batch size
- Add pagination for large user bases
- Optimize database queries
- Consider splitting into multiple functions

## Support

For issues or questions:
1. Check function logs: `supabase functions logs send-reminders`
2. Review Resend dashboard for email delivery status
3. Test with a single user first
4. Check database for correct data structure
