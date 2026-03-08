type RuntimeEnv = Record<string, string | undefined>;

declare global {
  interface Window {
    __MYRENEWLY_ENV__?: RuntimeEnv;
  }
}

function getRuntimeEnv(): RuntimeEnv | undefined {
  if (typeof window === "undefined") return undefined;
  return window.__MYRENEWLY_ENV__;
}

export function getEnv(key: string): string | undefined {
  const runtime = getRuntimeEnv();
  const runtimeVal = runtime?.[key];
  if (runtimeVal != null && runtimeVal !== "") return runtimeVal;

  // Vite exposes env vars on `import.meta.env` (only those prefixed with VITE_)
  // We access dynamically so we can share this helper across the app.
  const viteEnv = import.meta.env as unknown as Record<string, string | undefined>;
  const viteVal = viteEnv[key];
  if (viteVal != null && viteVal !== "") return viteVal;

  return undefined;
}

export function getEnvOrThrow(key: string): string {
  const val = getEnv(key);
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}

