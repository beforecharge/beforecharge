// Runtime environment overrides for deployments.
// This file is loaded before the app bundle (see `index.html`).
//
// Deploy-time usage:
// - Set these values in your hosting pipeline (or edit the served file)
// - Avoid committing real keys to git; keep this file with empty defaults
//
// Supported keys mirror Vite's `import.meta.env.VITE_*` names.
window.__BEFORECHARGE_ENV__ = {
  // Supabase
  VITE_SUPABASE_URL: "",
  VITE_SUPABASE_ANON_KEY: "",
  VITE_SUPABASE_STORAGE_BUCKET: "receipts",

  // App
  VITE_APP_NAME: "BeforeCharge",
  VITE_APP_URL: "",
};

