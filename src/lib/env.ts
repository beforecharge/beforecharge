type RuntimeEnv = Record<string, string | undefined>;

declare global {
  interface Window {
    __BEFORECHARGE_ENV__?: RuntimeEnv;
  }
}

function getRuntimeEnv(): RuntimeEnv | undefined {
  if (typeof window === "undefined") return undefined;
  return window.__BEFORECHARGE_ENV__;
}

export function getEnv(key: string): string | undefined {
  const runtime = getRuntimeEnv();
  const runtimeVal = runtime?.[key];
  if (runtimeVal != null && runtimeVal !== "") return runtimeVal;

  // Next.js statically replaces process.env during build. 
  // We must access them explicitly, not dynamically via `process.env[key]`.
  const processEnv: Record<string, string | undefined> = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    VITE_APP_NAME: process.env.VITE_APP_NAME,
    VITE_APP_URL: process.env.VITE_APP_URL,
    VITE_SUPABASE_STORAGE_BUCKET: process.env.VITE_SUPABASE_STORAGE_BUCKET,
    VITE_ENABLE_GOOGLE_AUTH: process.env.VITE_ENABLE_GOOGLE_AUTH,
    VITE_ENABLE_EMAIL_REMINDERS: process.env.VITE_ENABLE_EMAIL_REMINDERS,
    VITE_ENABLE_RECEIPT_UPLOAD: process.env.VITE_ENABLE_RECEIPT_UPLOAD,
    VITE_ENABLE_ANALYTICS: process.env.VITE_ENABLE_ANALYTICS,
    VITE_DEFAULT_CURRENCY: process.env.VITE_DEFAULT_CURRENCY,
    VITE_SUPPORTED_CURRENCIES: process.env.VITE_SUPPORTED_CURRENCIES,
    VITE_CREATE_DUMMY_DATA: process.env.VITE_CREATE_DUMMY_DATA,
  };

  const nextVal = processEnv[key];
  if (nextVal != null && nextVal !== "") return nextVal;

  return undefined;
}

export function getEnvOrThrow(key: string): string {
  const val = getEnv(key);
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}

