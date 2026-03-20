declare namespace NodeJS {
  interface ProcessEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_SUPABASE_STORAGE_BUCKET: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_URL: string;
    readonly VITE_CREATE_DUMMY_DATA: string;
    readonly VITE_ENABLE_GOOGLE_AUTH: string;
    readonly VITE_ENABLE_EMAIL_REMINDERS: string;
    readonly VITE_ENABLE_RECEIPT_UPLOAD: string;
    readonly VITE_ENABLE_ANALYTICS: string;
    readonly VITE_DEFAULT_CURRENCY: string;
    readonly VITE_SUPPORTED_CURRENCIES: string;
    readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
    readonly VITE_RAZORPAY_KEY_ID?: string;
  }
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_STORAGE_BUCKET: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_URL: string;
  readonly VITE_CREATE_DUMMY_DATA: string;
  readonly VITE_ENABLE_GOOGLE_AUTH: string;
  readonly VITE_ENABLE_EMAIL_REMINDERS: string;
  readonly VITE_ENABLE_RECEIPT_UPLOAD: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_DEFAULT_CURRENCY: string;
  readonly VITE_SUPPORTED_CURRENCIES: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
