import React, { useState, useEffect, useCallback } from "react";
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
import {
  CreditCard,
  Lock,
  Check,
  AlertCircle,
  Smartphone,
  Banknote,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePayment } from "@/hooks/usePayment";
import { PlanType } from "@/types/payment.types";
import { PLANS, YEARLY_PLANS } from "@/lib/constants";
import toast from "react-hot-toast";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: PlanType;
  billingInterval: "monthly" | "yearly";
}

// Utility to load Razorpay script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  onClose,
  planType,
  billingInterval,
}) => {
  const { user } = useAuth();
  const { createRazorpayOrder, verifyPayment } = usePayment();

  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get plan details
  const plans = billingInterval === "yearly" ? YEARLY_PLANS : PLANS;
  const plan = plans.find((p) => p.type === planType);
  const price = plan?.price.inr || 0;

  // Load Razorpay script on mount
  useEffect(() => {
    if (isOpen && !scriptLoaded) {
      loadRazorpayScript().then(setScriptLoaded);
    }
  }, [isOpen, scriptLoaded]);

  // Handle payment initiation
  const handlePayment = async () => {
    if (!user || !plan || !scriptLoaded) {
      setError("Payment system not ready. Please try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create Razorpay order
      const order = await createRazorpayOrder({
        planType,
        currency: "INR",
        userId: user.id,
        billingInterval,
        notes: {
          planName: plan.name,
          billingInterval,
          userEmail: user.email || "",
        },
      });

      if (!order.id) {
        throw new Error("Failed to create payment order");
      }

      // Configure Razorpay options
      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "BeforeCharge",
        description: `${plan.name} Plan - ${billingInterval}`,
        order_id: order.id,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment with our backend
            const isVerified = await verifyPayment(
              response.razorpay_payment_id,
              "razorpay",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
            );

            if (isVerified) {
              setPaymentCompleted(true);
              toast.success(`Successfully upgraded to ${plan.name}!`);

              // Close modal after success
              setTimeout(() => {
                onClose();
                setPaymentCompleted(false);
                window.location.reload();
              }, 2000);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.email?.split("@")[0] || "",
          email: user.email || "",
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        setError(
          response.error.description || "Payment failed. Please try again.",
        );
        setIsLoading(false);
      });

      rzp.open();
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      setError(
        error.message || "Failed to initialize payment. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!isLoading && !paymentCompleted) {
      onClose();
      setError(null);
    }
  }, [onClose, isLoading, paymentCompleted]);

  if (!plan) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Invalid plan selected</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Success state
  if (paymentCompleted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center p-6">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-900/20 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-green-900 mb-2">
              Payment Successful!
            </DialogTitle>
            <DialogDescription>
              Your payment has been processed successfully.
            </DialogDescription>
            <p className="text-muted-foreground mb-4">
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Your Upgrade
          </DialogTitle>
          <DialogDescription>
            Complete your payment using Razorpay to upgrade your subscription
            plan.
          </DialogDescription>
        </DialogHeader>

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
                    ₹{price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{billingInterval === "yearly" ? "year" : "month"}
                    </span>
                  </span>
                </div>
                {billingInterval === "yearly" && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Save {planType === "premium" ? "₹29/month" : "₹39/month"}{" "}
                    with yearly billing
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Supported Payment Methods</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-background">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Credit/Debit Cards</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-background">
                <Banknote className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Net Banking</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-background">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">UPI</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-background">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Wallets</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Security Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>
              Your payment is secured by Razorpay with 256-bit SSL encryption
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!scriptLoaded || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : !scriptLoaded ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay ₹{price}
                </>
              )}
            </Button>
          </div>

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

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              SSL Secured
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              PCI Compliant
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Bank Level Security
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RazorpayPaymentModal;
