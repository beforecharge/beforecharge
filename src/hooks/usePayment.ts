import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

import {
  PaymentProvider,
  PaymentConfig,
  PlanType,
  StripePaymentIntentRequest,
  StripePaymentIntentResponse,
  RazorpayOrderRequest,
  RazorpayOrderResponse,
} from "@/types/payment.types";
import toast from "react-hot-toast";

interface UsePaymentReturn {
  paymentConfig: PaymentConfig | null;
  isConfigLoading: boolean;
  isProcessing: boolean;
  createPaymentIntent: (
    request: StripePaymentIntentRequest,
  ) => Promise<StripePaymentIntentResponse>;
  createRazorpayOrder: (
    request: RazorpayOrderRequest,
  ) => Promise<RazorpayOrderResponse>;
  verifyPayment: (
    paymentId: string,
    provider: PaymentProvider,
    payload?: Record<string, unknown>,
  ) => Promise<boolean>;
  getUserPlan: () => Promise<{ type: PlanType; expires_at?: string } | null>;
}

export const usePayment = (): UsePaymentReturn => {
  const { user, profile } = useAuth();
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(
    null,
  );
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Determine payment provider based on user location/currency
  useEffect(() => {
    const getPaymentConfig = async () => {
      setIsConfigLoading(true);

      try {
        // Default to USD/Stripe
        let provider: PaymentProvider = "stripe";
        let currency = "USD";

        // Check user's preferred currency
        if (profile?.default_currency === "INR") {
          provider = "razorpay";
          currency = "INR";
        }

        // You could also detect location via IP geolocation here
        // const location = await detectUserLocation();
        // if (location?.country === 'IN') {
        //   provider = 'razorpay';
        //   currency = 'INR';
        // }

        const config: PaymentConfig = {
          provider,
          currency: currency as "USD" | "INR",
          publishableKey:
            (provider === "stripe"
              ? process.env.VITE_STRIPE_PUBLISHABLE_KEY
              : process.env.VITE_RAZORPAY_KEY_ID) || "",
        };

        setPaymentConfig(config);
      } catch (error) {
        console.error("Error getting payment config:", error);
        toast.error("Failed to load payment configuration");
      } finally {
        setIsConfigLoading(false);
      }
    };

    getPaymentConfig();
  }, [profile]);

  const createPaymentIntent = async (
    request: StripePaymentIntentRequest,
  ): Promise<StripePaymentIntentResponse> => {
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-stripe-intent",
        {
          body: {
            planType: request.planType,
            currency: request.currency,
            userId: request.userId,
            billingInterval: request.billingInterval,
            metadata: request.metadata,
          },
        },
      );

      if (error) {
        throw new Error(error.message || "Failed to create payment intent");
      }

      return data as StripePaymentIntentResponse;
    } catch (error) {
      console.error("Error creating Stripe payment intent:", error);
      toast.error("Failed to initialize payment");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const createRazorpayOrder = async (
    request: RazorpayOrderRequest,
  ): Promise<RazorpayOrderResponse> => {
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            planType: request.planType,
            currency: request.currency,
            userId: request.userId,
            billingInterval: request.billingInterval,
            notes: request.notes,
          },
        },
      );

      if (error) {
        throw new Error(error.message || "Failed to create Razorpay order");
      }

      return data as RazorpayOrderResponse;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      toast.error("Failed to initialize payment");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (
    paymentId: string,
    provider: PaymentProvider,
    payload: Record<string, unknown> = {},
  ): Promise<boolean> => {
    setIsProcessing(true);

    try {
      const functionName =
        provider === "stripe"
          ? "verify-stripe-payment"
          : "verify-razorpay-payment";

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          paymentId,
          ...payload,
        },
      });

      if (error) {
        throw new Error(error.message || "Payment verification failed");
      }

      const isVerified = data?.verified === true;

      if (isVerified) {
        toast.success("Payment verified successfully!");
        // Refresh user data to get updated plan
        window.location.reload(); // Simple refresh, you could implement more sophisticated state update
      } else {
        toast.error("Payment verification failed");
      }

      return isVerified;
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Failed to verify payment");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const getUserPlan = async (): Promise<{
    type: PlanType;
    expires_at?: string;
  } | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("plan_type, plan_expires_at")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }

      const planType = (data?.plan_type as PlanType | undefined) || "free";
      const expiresAt = data?.plan_expires_at || undefined;

      if (expiresAt) {
        const expiresMs = new Date(expiresAt).getTime();
        if (!Number.isNaN(expiresMs) && expiresMs <= Date.now()) {
          return { type: "free" };
        }
      }

      return expiresAt ? { type: planType, expires_at: expiresAt } : { type: planType };
    } catch (error) {
      console.error("Error fetching user plan:", error);
      return { type: "free" };
    }
  };

  return {
    paymentConfig,
    isConfigLoading,
    isProcessing,
    createPaymentIntent,
    createRazorpayOrder,
    verifyPayment,
    getUserPlan,
  };
};
