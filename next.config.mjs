/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "",
    VITE_APP_NAME: process.env.VITE_APP_NAME || "BeforeCharge",
    VITE_APP_URL: process.env.VITE_APP_URL || "http://localhost:3000",
    VITE_SUPABASE_STORAGE_BUCKET: process.env.VITE_SUPABASE_STORAGE_BUCKET || "receipts",
    VITE_ENABLE_GOOGLE_AUTH: process.env.VITE_ENABLE_GOOGLE_AUTH || "true",
    VITE_ENABLE_EMAIL_REMINDERS: process.env.VITE_ENABLE_EMAIL_REMINDERS || "false",
    VITE_ENABLE_RECEIPT_UPLOAD: process.env.VITE_ENABLE_RECEIPT_UPLOAD || "true",
    VITE_ENABLE_ANALYTICS: process.env.VITE_ENABLE_ANALYTICS || "true",
    VITE_DEFAULT_CURRENCY: process.env.VITE_DEFAULT_CURRENCY || "USD",
    VITE_SUPPORTED_CURRENCIES: process.env.VITE_SUPPORTED_CURRENCIES || "USD,EUR,GBP,INR,AED",
    VITE_CREATE_DUMMY_DATA: process.env.VITE_CREATE_DUMMY_DATA || "false"
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  }
};
export default nextConfig;
