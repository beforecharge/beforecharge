# Google OAuth Verification Materials

To pass the Google OAuth verification for the restricted `gmail.readonly` scope, you need to provide Google with a **Scope Justification**, an explanation of **Intended Data Usage**, and a link to a **Demo Video**.

You can copy and paste the following templates directly into your Google Cloud Console verification form.

---

## 1. Scope Justification
**Copy and paste this into the "Scope Justification" field:**

BeforeCharge is a personal finance platform designed to help users track recurring subscriptions and avoid unwanted auto-renewal charges. We are requesting the `https://www.googleapis.com/auth/gmail.readonly` scope because our app's core value proposition relies on automatically detecting a user's active subscriptions directly from their email inbox. 

By analyzing emails from known billers and identifying subscription receipts or invoices, BeforeCharge saves users the tedious process of manually entering their recurring costs. This read-only access is strictly necessary to perform automated searches for subscription metadata, enabling our app to proactively alert users before a charge hits their bank account.

---

## 2. Intended Data Usage
**Copy and paste this into the "Intended Data Usage" field:**

When a user links their Gmail account, BeforeCharge uses the `gmail.readonly` scope to search for emails that match specific known subscription providers (e.g., Netflix, Spotify) or contain billing keywords (e.g., "receipt", "subscription renewal"). 

Our secure parsing engine extracts only the minimal required metadata from these identified emails: the service name, the recurring cost, and the billing cycle. Once this subscription data is parsed and populated into the user's BeforeCharge dashboard, the email body data is immediately discarded from memory. 

We do not persistently store user emails, we do not read personal correspondence, and we absolutely do not sell or share this data with third parties or advertising networks. The data is used exclusively to provide the subscription tracking and alert functionalities visible to the user within the BeforeCharge app.

---

## 3. Demo Video Requirements
Google requires a publicly accessible YouTube video demonstrating the OAuth flow and how the data is used in your app. 

**Script & Steps to Record for your Demo Video:**
1. **Show the App:** Start on the BeforeCharge homepage and log in.
2. **Show the Integration Action:** Click the "Connect Gmail" or "Sync Subscriptions" button in the BeforeCharge dashboard.
3. **Show the URL Bar:** **(CRITICAL)** Clearly show the browser's URL bar displaying your Google OAuth Client ID when the Google Sign-in screen appears.
4. **Show the Consent Screen:** Walk through the Google Consent screen. Explicitly show the app name (BeforeCharge) requesting the Gmail Read-Only scope.
5. **Explain the Purpose:** While clicking "Allow", explain verbally or using on-screen text: *"The user grants BeforeCharge read-only access to their emails so our system can detect subscription receipts."*
6. **Show the Result:** Return to the BeforeCharge app. Show the dashboard successfully populating with a detected subscription (e.g., a mock Netflix receipt that was in the linked inbox).
7. **Explain Data Usage:** Conclude the video by stating: *"BeforeCharge parses the cost and renewal date from the billing email to populate this dashboard, and then immediately discards the email data. We do not store email bodies."*

**Once recorded:** 
Upload this video to YouTube as "Unlisted" and provide the link to the Google Trust & Safety team in your verification request.
