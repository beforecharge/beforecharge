import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

import {
  PaymentProvider,
  PaymentConfig,
  PlanType,
  CheckoutRequest,
  CheckoutResponse,
} from "@/types/payment.types";
import toast from "react-hot-toast";

interface UsePaymentReturn {
  paymentConfig: PaymentConfig | null;
  isConfigLoading: boolean;
  isProcessing: boolean;
  createCheckout: (
    request: CheckoutRequest,
  ) => Promise<CheckoutResponse>;
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

  useEffect(() => {
    const getPaymentConfig = async () => {
      setIsConfigLoading(true);

      try {
        const provider: PaymentProvider = "lemonsqueezy";
        const currency = profile?.default_currency || "USD";

        const config: PaymentConfig = {
          provider,
          currency: currency as any,
          storeId: process.env.VITE_LEMONSQUEEZY_STORE_ID,
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

  const createCheckout = async (
    request: CheckoutRequest,
  ): Promise<CheckoutResponse> => {
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-lemonsqueezy-checkout",
        {
          body: {
            planType: request.planType,
            currency: request.currency,
            userId: request.userId,
            billingInterval: request.billingInterval,
          },
        },
      );

      if (error) {
        throw new Error(error.message || "Failed to create checkout");
      }

      return data as CheckoutResponse;
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Failed to initialize payment");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };


  const verifyPayment = async (
    paymentId: string,
    _provider: PaymentProvider,
    payload: Record<string, unknown> = {},
  ): Promise<boolean> => {
    setIsProcessing(true);

    try {
      const functionName = "verify-lemonsqueezy-payment";

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
    createCheckout,
    verifyPayment,
    getUserPlan,
  };
};
