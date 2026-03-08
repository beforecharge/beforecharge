// Core subscription types
export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cost: number;
  currency: Currency;
  billing_cycle: BillingCycle;
  renewal_date: string;
  category_id: string;
  tags: string[];
  receipt_url?: string;
  is_active: boolean;
  last_used_date?: string;
  trial_end_date?: string;
  website_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

// Enums and constants
export type BillingCycle =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semi-annual"
  | "annual";

export type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "JPY"
  | "CHF"
  | "SEK"
  | "NOK"
  | "DKK"
  | "INR"
  | "AED";

export type SubscriptionStatus = "active" | "cancelled" | "trial" | "expired";

export type NotificationType =
  | "renewal"
  | "trial_ending"
  | "price_change"
  | "cancellation";

export type ReminderDays = 1 | 3 | 7 | 14 | 30;

// User and authentication types
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  default_currency: Currency;
  timezone: string;
  notification_preferences: NotificationPreferences;
  plan_type?: "free" | "premium" | "enterprise";
  plan_expires_at?: string | null;
  plan_provider?: "stripe" | "razorpay" | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  email_reminders: boolean;
  push_notifications: boolean;
  reminder_days: ReminderDays[];
  trial_reminders: boolean;
  price_change_alerts: boolean;
}

// Analytics and dashboard types
export interface DashboardStats {
  total_monthly_cost: number;
  total_annual_cost: number;
  active_subscriptions: number;
  cancelled_subscriptions: number;
  upcoming_renewals: number;
  total_saved: number;
}

export interface SpendingTrend {
  month: string;
  amount: number;
  change_percentage: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  subscriptions_count: number;
}

export interface UpcomingRenewal {
  subscription: Subscription;
  days_until_renewal: number;
  category: Category;
}

export interface CostOptimization {
  unused_subscriptions: Subscription[];
  annual_savings_opportunities: AnnualSavingsOpportunity[];
  duplicate_subscriptions: DuplicateSubscription[];
  spending_comparison: SpendingComparison;
}

export interface AnnualSavingsOpportunity {
  subscription: Subscription;
  monthly_cost: number;
  annual_cost: number;
  potential_savings: number;
  savings_percentage: number;
}

export interface DuplicateSubscription {
  subscriptions: Subscription[];
  category: string;
  potential_savings: number;
}

export interface SpendingComparison {
  current_month: number;
  previous_month: number;
  change_amount: number;
  change_percentage: number;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  subscription_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface ReminderJob {
  id: string;
  subscription_id: string;
  user_id: string;
  reminder_date: string;
  notification_type: NotificationType;
  is_sent: boolean;
  created_at: string;
}

// Form types
export interface SubscriptionFormData {
  name: string;
  description?: string;
  cost: string;
  currency: Currency;
  billing_cycle: BillingCycle;
  renewal_date: string;
  category_id: string;
  tags: string[];
  receipt?: File;
  website_url?: string;
  notes?: string;
  trial_end_date?: string;
}

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
}

export interface TagFormData {
  name: string;
  color: string;
}

// Filter and search types
export interface SubscriptionFilters {
  categories: string[];
  tags: string[];
  billing_cycles: BillingCycle[];
  currencies: Currency[];
  status: SubscriptionStatus[];
  cost_range: {
    min: number;
    max: number;
  };
  renewal_date_range: {
    start: string;
    end: string;
  };
}

export interface SearchOptions {
  query: string;
  filters: Partial<SubscriptionFilters>;
  sort_by: "name" | "cost" | "renewal_date" | "created_at";
  sort_order: "asc" | "desc";
}

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// Settings types
export interface AppSettings {
  theme: "light" | "dark" | "system";
  default_currency: Currency;
  default_billing_cycle: BillingCycle;
  notification_preferences: NotificationPreferences;
  data_export_preferences: {
    format: "csv" | "json";
    include_receipts: boolean;
  };
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

// Receipt and file types
export interface Receipt {
  id: string;
  subscription_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface FileUploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Navigation types
export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

// Export data types
export interface ExportData {
  subscriptions: Subscription[];
  categories: Category[];
  tags: Tag[];
  exported_at: string;
  user_id: string;
}

// Default values and constants
export const DEFAULT_CATEGORIES: Omit<
  Category,
  "id" | "created_at" | "updated_at"
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

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  INR: "₹",
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  "semi-annual": "Semi-Annual",
  annual: "Annual",
};

export const BILLING_CYCLE_MULTIPLIERS: Record<BillingCycle, number> = {
  daily: 365,
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  "semi-annual": 2,
  annual: 1,
};
