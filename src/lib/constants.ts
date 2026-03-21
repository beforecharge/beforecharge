import {
  Currency,
  BillingCycle,
  ReminderDays,
  Category,
  NavigationItem,
  NotificationPreferences,
  AppSettings,
} from "@/types/app.types";
import { Plan, PlanType, PlanFeatures } from "@/types/payment.types";
import { getEnv } from "@/lib/env";

// App Configuration
export const APP_CONFIG = {
  name: getEnv("VITE_APP_NAME") || "BeforeCharge",
  version: "1.0.0",
  description: "Track and manage your subscriptions",
  url: getEnv("VITE_APP_URL") || "http://localhost:5173",
  support_email: "support@subscriptionmanager.com",
  max_file_size: 10 * 1024 * 1024, // 10MB
  allowed_file_types: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ],
} as const;

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: getEnv("VITE_SUPABASE_URL"),
  anonKey: getEnv("VITE_SUPABASE_ANON_KEY"),
  storageBucket: getEnv("VITE_SUPABASE_STORAGE_BUCKET") || "receipts",
} as const;

// Feature Flags
export const FEATURES = {
  googleAuth: getEnv("VITE_ENABLE_GOOGLE_AUTH") === "true",
  emailReminders: getEnv("VITE_ENABLE_EMAIL_REMINDERS") === "true",
  receiptUpload: getEnv("VITE_ENABLE_RECEIPT_UPLOAD") === "true",
  analytics: getEnv("VITE_ENABLE_ANALYTICS") === "true",
  darkMode: true,
  csvExport: true,
  bulkEdit: true,
  advancedFilters: true,
} as const;

// Currency Configuration
export const CURRENCY_CONFIG = {
  default: (getEnv("VITE_DEFAULT_CURRENCY") as Currency) || "USD",
  supported: (getEnv("VITE_SUPPORTED_CURRENCIES")?.split(",") as Currency[]) || [
    "USD",
    "EUR",
    "GBP",
    "AED",
    "INR",
    "CAD",
    "AUD",
    "JPY",
    "CHF",
    "SEK",
    "NOK",
    "DKK",
  ],
} as const;

// Default Values
export const DEFAULTS = {
  currency: CURRENCY_CONFIG.default,
  billing_cycle: "monthly" as BillingCycle,
  reminder_days: [7, 3, 1] as ReminderDays[],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  theme: "system" as const,
  pagination_limit: 20,
  chart_colors: [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
    "#f97316",
    "#6366f1",
  ],
} as const;

// Navigation Configuration
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
  },
  {
    name: "Subscriptions",
    href: "/subscriptions",
    icon: "CreditCard",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: "BarChart3",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: "Settings",
  },
];

// Default Categories
export const DEFAULT_CATEGORIES: Omit<
  Category,
  "id" | "created_at" | "updated_at" | "user_id"
>[] = [
  { name: "Streaming", icon: "Play", color: "#ef4444", is_default: true },
  { name: "Software", icon: "Code", color: "#3b82f6", is_default: true },
  { name: "Fitness", icon: "Dumbbell", color: "#10b981", is_default: true },
  { name: "Music", icon: "Music", color: "#8b5cf6", is_default: true },
  { name: "News", icon: "Newspaper", color: "#f59e0b", is_default: true },
  { name: "Gaming", icon: "Gamepad2", color: "#06b6d4", is_default: true },
  {
    name: "Education",
    icon: "GraduationCap",
    color: "#84cc16",
    is_default: true,
  },
  { name: "Business", icon: "Building", color: "#6366f1", is_default: true },
  { name: "Utilities", icon: "Zap", color: "#f97316", is_default: true },
  { name: "Food & Drink", icon: "Coffee", color: "#ec4899", is_default: true },
  { name: "Transportation", icon: "Car", color: "#14b8a6", is_default: true },
  { name: "Shopping", icon: "ShoppingBag", color: "#f43f5e", is_default: true },
  { name: "Finance", icon: "CreditCard", color: "#22c55e", is_default: true },
  {
    name: "Communication",
    icon: "MessageCircle",
    color: "#a855f7",
    is_default: true,
  },
  { name: "Storage", icon: "HardDrive", color: "#64748b", is_default: true },
];

// Default Tags
export const DEFAULT_TAGS = [
  { name: "Work", color: "#3b82f6" },
  { name: "Personal", color: "#10b981" },
  { name: "Shared", color: "#f59e0b" },
  { name: "Essential", color: "#ef4444" },
  { name: "Optional", color: "#8b5cf6" },
  { name: "Trial", color: "#06b6d4" },
];

// Payment Plans Configuration
export const PLANS: Plan[] = [
  {
    type: "free",
    name: "Free",
    description: "Try BeforeCharge with the essentials",
    price: {
      usd: 0,
      inr: 0,
    },
    features: [
      "Up to 3 subscriptions",
      "Upcoming renewals list",
      "Basic reminders",
      "Manual data entry",
    ],
    limits: {
      subscriptions: 3,
      categories: 10,
      reminders: true,
      analytics: false,
      export: false,
      support: "email",
    },
  },
  {
    type: "premium",
    name: "Personal",
    description:
      "For individuals who want reminders + insights",
    price: {
      usd: 6.99,
      inr: 299,
    },
    features: [
      "Up to 25 subscriptions",
      "Advanced analytics & insights",
      "Smart reminders",
      "Data export (CSV)",
      "Priority support",
      "Cost optimization tips",
      "Cancellation guides (Coming Soon)",
      "Calendar view (Coming Soon)",
    ],
    limits: {
      subscriptions: 25,
      categories: "unlimited",
      reminders: true,
      analytics: true,
      export: true,
      support: "priority",
    },
    popular: true,
  },
  {
    type: "enterprise",
    name: "Business / Teams",
    description: "For teams tracking shared + vendor subscriptions",
    price: {
      usd: 19.99,
      inr: 999,
    },
    features: [
      "Unlimited subscriptions",
      "Everything in Personal",
      "Team collaboration",
      "Advanced reporting",
      "Dedicated support",
      "Custom categories",
      "Multi-workspace support (Coming Soon)",
      "Auto-fetch subscriptions (Coming Soon)",
    ],
    limits: {
      subscriptions: "unlimited",
      categories: "unlimited",
      reminders: true,
      analytics: true,
      export: true,
      support: "dedicated",
    },
  },
];

// Yearly Plans Configuration (with discount)
export const YEARLY_PLANS: Plan[] = [
  {
    type: "free",
    name: "Free",
    description: "Try BeforeCharge with the essentials",
    price: {
      usd: 0,
      inr: 0,
    },
    features: [
      "Up to 3 subscriptions",
      "Upcoming renewals list",
      "Basic reminders",
      "Manual data entry",
    ],
    limits: {
      subscriptions: 3,
      categories: 10,
      reminders: true,
      analytics: false,
      export: false,
      support: "email",
    },
  },
  {
    type: "premium",
    name: "Personal",
    description:
      "For individuals who want reminders + insights",
    price: {
      usd: 69.99,
      inr: 2990,
    },
    features: [
      "Up to 25 subscriptions",
      "Advanced analytics & insights",
      "Smart reminders",
      "Data export (CSV)",
      "Priority support",
      "Cost optimization tips",
      "Cancellation guides (Coming Soon)",
      "Calendar view (Coming Soon)",
    ],
    limits: {
      subscriptions: 25,
      categories: "unlimited",
      reminders: true,
      analytics: true,
      export: true,
      support: "priority",
    },
    popular: true,
  },
  {
    type: "enterprise",
    name: "Business / Teams",
    description: "For teams tracking shared + vendor subscriptions",
    price: {
      usd: 199.0,
      inr: 9990,
    },
    features: [
      "Unlimited subscriptions",
      "Everything in Personal",
      "Team collaboration",
      "Advanced reporting",
      "Dedicated support",
      "Custom categories",
      "Multi-workspace support (Coming Soon)",
      "Auto-fetch subscriptions (Coming Soon)",
    ],
    limits: {
      subscriptions: "unlimited",
      categories: "unlimited",
      reminders: true,
      analytics: true,
      export: true,
      support: "dedicated",
    },
  },
];

// Plan Features Configuration
export const PLAN_FEATURES: Record<PlanType, string[]> = {
  free: [
    "Up to 3 subscriptions",
    "Renewal tracking",
    "Basic reminders",
    "Manual entry",
  ],
  premium: [
    "Up to 25 subscriptions",
    "Advanced analytics",
    "Smart reminders",
    "Data export (CSV)",
    "Priority support",
    "Cost optimization tips",
  ],
  enterprise: [
    "Unlimited subscriptions",
    "Everything in Personal",
    "Team collaboration",
    "Advanced reporting",
    "Dedicated support",
    "Custom categories",
  ],
};

export const PLAN_DISPLAY_NAMES: Record<PlanType, string> = {
  free: "Free",
  premium: "Personal",
  enterprise: "Business / Teams",
};

// Plan Limits Configuration
export const PLAN_LIMITS: Record<PlanType, PlanFeatures> = {
  free: {
    subscriptions: 3,
    categories: 10,
    reminders: true,
    analytics: false,
    export: false,
    api_access: false,
    priority_support: false,
    custom_integrations: false,
  },
  premium: {
    subscriptions: 25,
    categories: "unlimited",
    reminders: true,
    analytics: true,
    export: true,
    api_access: false,
    priority_support: true,
    custom_integrations: false,
  },
  enterprise: {
    subscriptions: "unlimited",
    categories: "unlimited",
    reminders: true,
    analytics: true,
    export: true,
    api_access: true,
    priority_support: true,
    custom_integrations: true,
  },
};

// Validation Rules
export const VALIDATION = {
  subscription: {
    name: {
      minLength: 1,
      maxLength: 100,
    },
    description: {
      maxLength: 500,
    },
    cost: {
      min: 0,
      max: 999999.99,
    },
    notes: {
      maxLength: 1000,
    },
  },
  category: {
    name: {
      minLength: 1,
      maxLength: 50,
    },
  },
  tag: {
    name: {
      minLength: 1,
      maxLength: 30,
    },
  },
  profile: {
    full_name: {
      maxLength: 100,
    },
  },
} as const;

// Chart Configuration
export const CHART_CONFIG = {
  defaultHeight: 300,
  colors: {
    primary: "#3b82f6",
    secondary: "#10b981",
    accent: "#f59e0b",
    muted: "#64748b",
    danger: "#ef4444",
    warning: "#f97316",
    success: "#22c55e",
  },
  gradients: {
    blue: ["#3b82f6", "#1d4ed8"],
    green: ["#10b981", "#047857"],
    purple: ["#8b5cf6", "#7c3aed"],
    orange: ["#f59e0b", "#d97706"],
    red: ["#ef4444", "#dc2626"],
  },
  animations: {
    duration: 800,
    delay: 100,
  },
} as const;

// Date and Time Configuration
export const DATE_CONFIG = {
  formats: {
    display: "MMM dd, yyyy",
    input: "yyyy-MM-dd",
    full: "EEEE, MMMM dd, yyyy",
    short: "MMM dd",
    time: "HH:mm",
    datetime: "MMM dd, yyyy HH:mm",
  },
  reminder_options: [
    { value: 1 as ReminderDays, label: "1 day before" },
    { value: 3 as ReminderDays, label: "3 days before" },
    { value: 7 as ReminderDays, label: "1 week before" },
    { value: 14 as ReminderDays, label: "2 weeks before" },
    { value: 30 as ReminderDays, label: "1 month before" },
  ],
} as const;

// UI Configuration
export const UI_CONFIG = {
  sidebar: {
    width: 256,
    collapsedWidth: 80,
  },
  header: {
    height: 64,
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },
  animations: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  generic: "Something went wrong. Please try again.",
  network: "Network error. Please check your connection.",
  unauthorized: "You are not authorized to perform this action.",
  notFound: "The requested resource was not found.",
  validation: "Please check your input and try again.",
  fileUpload: "Failed to upload file. Please try again.",
  fileSizeLimit: `File size must be less than ${APP_CONFIG.max_file_size / 1024 / 1024}MB`,
  fileTypeNotAllowed: "File type not allowed",
  emailRequired: "Email is required",
  passwordRequired: "Password is required",
  passwordTooShort: "Password must be at least 6 characters",
  invalidEmail: "Please enter a valid email address",
  nameRequired: "Name is required",
  costRequired: "Cost is required",
  costInvalid: "Please enter a valid cost",
  dateRequired: "Date is required",
  categoryRequired: "Category is required",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  subscriptionCreated: "Subscription created successfully",
  subscriptionUpdated: "Subscription updated successfully",
  subscriptionDeleted: "Subscription deleted successfully",
  categoryCreated: "Category created successfully",
  categoryUpdated: "Category updated successfully",
  categoryDeleted: "Category deleted successfully",
  tagCreated: "Tag created successfully",
  tagDeleted: "Tag deleted successfully",
  profileUpdated: "Profile updated successfully",
  settingsSaved: "Settings saved successfully",
  dataExported: "Data exported successfully",
  fileUploaded: "File uploaded successfully",
  emailSent: "Email sent successfully",
  passwordReset: "Password reset link sent to your email",
  signupSuccess: "Account created successfully",
  loginSuccess: "Logged in successfully",
  logoutSuccess: "Logged out successfully",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    logout: "/auth/logout",
    resetPassword: "/auth/reset-password",
    updatePassword: "/auth/update-password",
  },
  subscriptions: "/subscriptions",
  categories: "/categories",
  tags: "/tags",
  profile: "/profile",
  analytics: "/analytics",
  notifications: "/notifications",
  receipts: "/receipts",
  export: "/export",
} as const;

// Default Notification Preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email_reminders: true,
  push_notifications: false,
  reminder_days: [7, 3, 1],
  trial_reminders: true,
  price_change_alerts: true,
};

// Default App Settings
export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: "system",
  default_currency: CURRENCY_CONFIG.default,
  default_billing_cycle: "monthly",
  notification_preferences: DEFAULT_NOTIFICATION_PREFERENCES,
  data_export_preferences: {
    format: "csv",
    include_receipts: false,
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  theme: "subscription-manager-theme",
  sidebar: "subscription-manager-sidebar",
  filters: "subscription-manager-filters",
  preferences: "subscription-manager-preferences",
  onboarding: "subscription-manager-onboarding",
} as const;

// Query Keys for React Query (if used)
export const QUERY_KEYS = {
  subscriptions: "subscriptions",
  categories: "categories",
  tags: "tags",
  profile: "profile",
  analytics: "analytics",
  notifications: "notifications",
  dashboardStats: "dashboard-stats",
  upcomingRenewals: "upcoming-renewals",
  spendingTrends: "spending-trends",
  categorySpending: "category-spending",
} as const;

// Demo Data (for development/testing)
export const DEMO_SUBSCRIPTIONS = [
  {
    name: "Netflix",
    cost: 15.99,
    currency: "USD" as Currency,
    billing_cycle: "monthly" as BillingCycle,
    category: "Streaming",
    tags: ["Personal", "Essential"],
  },
  {
    name: "Adobe Creative Cloud",
    cost: 52.99,
    currency: "USD" as Currency,
    billing_cycle: "monthly" as BillingCycle,
    category: "Software",
    tags: ["Work", "Essential"],
  },
  {
    name: "Spotify Premium",
    cost: 9.99,
    currency: "USD" as Currency,
    billing_cycle: "monthly" as BillingCycle,
    category: "Music",
    tags: ["Personal", "Essential"],
  },
];

// Regex Patterns
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/i,
  currency: /^\d+(\.\d{1,2})?$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  newSubscription: "n",
  search: "/",
  toggleSidebar: "b",
  toggleTheme: "t",
  dashboard: "d",
  subscriptions: "s",
  analytics: "a",
  settings: ",",
} as const;
