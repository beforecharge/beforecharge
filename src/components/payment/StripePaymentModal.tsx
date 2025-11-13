import React, { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CreditCard, Lock, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePayment } from "@/hooks/usePayment";
import { PlanType } from "@/types/payment.types";
import { PLANS, YEARLY_PLANS } from "@/lib/constants";
import toast from "react-hot-toast";

// Initialize Stripe
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: PlanType;
  currency: "USD" | "INR";
  billingInterval: "monthly" | "yearly";
}

// Stripe Elements styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      "::placeholder": {
        color: "#aab7c4",
      },
      padding: "12px",
    },
    invalid: {
      color: "#9e2146",
    },
  },
  hidePostalCode: true,
};

// Payment Form Component
const PaymentForm: React.FC<{
  planType: PlanType;
  currency: "USD" | "INR";
  billingInterval: "monthly" | "yearly";
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ planType, currency, billingInterval, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { createPaymentIntent, verifyPayment } = usePayment();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Get plan details
  const plans = billingInterval === "yearly" ? YEARLY_PLANS : PLANS;
  const plan = plans.find((p) => p.type === planType);
  const price = plan?.price[currency.toLowerCase() as "usd" | "inr"] || 0;

  // Create payment intent on mount
  useEffect(() => {
    if (!user || !plan) return;

    const initializePayment = async () => {
      try {
        const intent = await createPaymentIntent({
          planType,
          currency: currency.toLowerCase() as "usd" | "inr",
          userId: user.id,
          metadata: {
            billingInterval,
            planName: plan.name,
          },
        });

        if (intent.client_secret) {
          setClientSecret(intent.client_secret);
        }
      } catch (error) {
        console.error("Failed to create payment intent:", error);
        setPaymentError("Failed to initialize payment. Please try again.");
      }
    };

    initializePayment();
  }, [user, plan, planType, currency, billingInterval, createPaymentIntent]);

  // Handle payment submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setPaymentError("Payment system not ready. Please wait...");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError("Card element not found");
      setIsProcessing(false);
      return;
    }

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.email || "",
              email: user?.email || "",
            },
          },
        });

      if (stripeError) {
        setPaymentError(stripeError.message || "Payment failed");
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Verify payment with our backend
        const isVerified = await verifyPayment(paymentIntent.id, "stripe");

        if (isVerified) {
          toast.success(`Successfully upgraded to ${plan?.name}!`);
          onSuccess();
        } else {
          setPaymentError(
            "Payment verification failed. Please contact support.",
          );
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!plan) {
    return (
      <div className="text-center p-6">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Invalid plan selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span>{plan.name} Plan</span>
            <Badge variant="default" className="capitalize">
              {billingInterval}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>
                {currency === "INR" ? "₹" : "$"}
                {price}
                <span className="text-sm font-normal text-muted-foreground">
                  /{billingInterval === "yearly" ? "year" : "month"}
                </span>
              </span>
            </div>
            {billingInterval === "yearly" && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Save{" "}
                {currency === "INR"
                  ? planType === "premium"
                    ? "₹29/month"
                    : "₹39/month"
                  : "$3.89/month"}{" "}
                with yearly billing
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Card Information
            </label>
            <div className="border rounded-lg p-4 bg-background">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {paymentError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{paymentError}</span>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!stripe || isProcessing || !clientSecret}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Pay {currency === "INR" ? "₹" : "$"}
                {price}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Features List */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-3">What you'll get:</h4>
        <ul className="space-y-2">
          {plan.features.slice(0, 4).map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Main Modal Component
const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  onClose,
  planType,
  currency,
  billingInterval,
}) => {
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handleSuccess = useCallback(() => {
    setPaymentCompleted(true);
    // Close modal after a brief delay
    setTimeout(() => {
      onClose();
      setPaymentCompleted(false);
      // Optionally reload page to refresh user data
      window.location.reload();
    }, 2000);
  }, [onClose]);

  const handleClose = useCallback(() => {
    if (!paymentCompleted) {
      onClose();
    }
  }, [onClose, paymentCompleted]);

  if (paymentCompleted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center p-6">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-green-900 mb-2">
              Payment Successful!
            </DialogTitle>
            <p className="text-gray-600 mb-4">
              Your subscription has been upgraded successfully.
            </p>
            <LoadingSpinner size="sm" />
            <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Your Upgrade
          </DialogTitle>
          <DialogDescription>
            {stripePromise
              ? "Complete your payment to upgrade your subscription plan."
              : "Payment system is not configured. Please contact support."}
          </DialogDescription>
        </DialogHeader>
        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <PaymentForm
              planType={planType}
              currency={currency}
              billingInterval={billingInterval}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </Elements>
        ) : (
          <div className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Payment processing is currently unavailable. Please try again
              later or contact support.
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StripePaymentModal;
