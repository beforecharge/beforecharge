export type PaymentProvider = "lemonsqueezy";

export type PlanType = "free" | "premium" | "enterprise";

export type Currency =
  | "USD"
  | "INR"
  | "EUR"
  | "GBP"
  | "AED"
  | "CAD"
  | "AUD"
  | "JPY";

export interface PaymentConfig {
  provider: PaymentProvider;
  currency: Currency;
  publishableKey?: string; // Not strictly needed for Lemon Squeezy checkout overlay in the same way, but kept for compatibility
  storeId?: string;
}

export interface PlanPrice {
  usd: number;
  inr: number;
}

export interface Plan {
  type: PlanType;
  name: string;
  description: string;
  price: PlanPrice;
  features: string[];
  limits: {
    subscriptions: number | "unlimited";
    categories: number | "unlimited";
    reminders: boolean;
    analytics: boolean;
    export: boolean;
    support: "email" | "priority" | "dedicated";
  };
  popular?: boolean;
  variantId?: string; // Lemon Squeezy Variant ID
}

export interface PlanFeatures {
  subscriptions: number | "unlimited";
  categories: number | "unlimited";
  reminders: boolean;
  analytics: boolean;
  export: boolean;
  api_access: boolean;
  priority_support: boolean;
  custom_integrations: boolean;
}

// Lemon Squeezy Types
export interface CheckoutRequest {
  planType: PlanType;
  currency: Currency;
  userId: string;
  billingInterval?: "monthly" | "yearly";
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface PaymentVerificationRequest {
  orderId: string;
  userId: string;
}

export interface PaymentVerificationResponse {
  verified: boolean;
  planType: PlanType;
  expiresAt: string;
}

// Database Types
export interface UserPlan {
  id: string;
  user_id: string;
  plan_type: PlanType;
  payment_provider: PaymentProvider;
  payment_id: string;
  amount: number;
  currency: Currency;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  user_plan_id: string;
  payment_provider: PaymentProvider;
  payment_id: string;
  payment_intent_id?: string;
  order_id?: string;
  amount: number;
  currency: Currency;
  status: "pending" | "succeeded" | "failed" | "cancelled";
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Webhook Types
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment: {
      entity: any;
    };
  };
  created_at: number;
}

// Payment Method Types
export interface PaymentMethod {
  id: string;
  type: "card" | "bank_account" | "upi" | "wallet";
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details?: {
    name: string;
    email: string;
    address?: {
      country: string;
      postal_code: string;
    };
  };
}

// Plan Limits and Features
export type PlanLimit = {
  [K in PlanType]: {
    subscriptions: number | "unlimited";
    categories: number | "unlimited";
    reminders: boolean;
    analytics: boolean;
    export: boolean;
    api_access: boolean;
    priority_support: boolean;
    custom_integrations: boolean;
  };
};

// Payment Status Types
export type PaymentStatus =
  | "idle"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface PaymentState {
  status: PaymentStatus;
  error?: string;
  paymentIntentId?: string;
  orderId?: string;
}

// Subscription Billing Types
export interface SubscriptionBilling {
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  trial_start?: string;
  trial_end?: string;
}

// Pricing Display Types
export interface PricingTier {
  name: string;
  price: {
    monthly: PlanPrice;
    annual: PlanPrice;
  };
  features: string[];
  cta: string;
  popular?: boolean;
}

export type BillingInterval = "monthly" | "annual";

// Country and Region Types
export interface CountryConfig {
  code: string;
  name: string;
  currency: Currency;
  paymentProvider: PaymentProvider;
  taxRate?: number;
}

// Discount and Coupon Types
export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  currency?: Currency;
  valid_from: string;
  valid_until: string;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
}

export interface AppliedDiscount {
  coupon_id: string;
  code: string;
  discount_amount: number;
  currency: Currency;
}
