import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Check,
  Star,
  Globe,
  Shield,
  Zap,
  Users,
  BarChart3,
  Bell,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePayment } from "@/hooks/usePayment";
import { StripePaymentModal, RazorpayPaymentModal } from "@/components/payment";
import { PLANS, YEARLY_PLANS, PLAN_FEATURES } from "@/lib/constants";
import { Plan, PlanType } from "@/types/payment.types";
import toast from "react-hot-toast";

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { paymentConfig, isConfigLoading, isProcessing } = usePayment();

  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [isStripeAvailable, setIsStripeAvailable] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] =
    useState<PlanType | null>(null);

  useEffect(() => {
    // Detect user location and set currency accordingly
    const detectUserLocation = () => {
      // Check if user is from India based on timezone or other indicators
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isIndianTimezone = timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta');
      
      // Also check user profile or payment config
      const userIsIndian =
        profile?.default_currency === "INR" ||
        paymentConfig?.provider === "razorpay" ||
        isIndianTimezone;
      
      setCurrency(userIsIndian ? "INR" : "USD");
    };

    detectUserLocation();
  }, [profile, paymentConfig]);

  useEffect(() => {
    // Check if Stripe is properly configured
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    setIsStripeAvailable(!!stripeKey);
  }, []);

  const handlePlanSelect = async (planType: PlanType) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!paymentConfig) {
      toast.error("Payment configuration not available");
      return;
    }

    setSelectedPlan(planType);
    setPlanLoading(true);

    try {
      const plan = PLANS.find((p) => p.type === planType);
      if (!plan) {
        throw new Error("Plan not found");
      }

      setSelectedPlanForPayment(planType);

      if (paymentConfig.provider === "stripe") {
        if (!isStripeAvailable) {
          toast.error(
            "Payment provider not configured. Please contact support.",
          );
          setPlanLoading(false);
          setSelectedPlanForPayment(null);
          return;
        }
        setShowStripeModal(true);
      } else if (paymentConfig.provider === "razorpay") {
        setShowRazorpayModal(true);
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Failed to initialize payment. Please try again.");
    } finally {
      setPlanLoading(false);
      setSelectedPlan(null);
    }
  };

  if (planLoading || isConfigLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" showText text="Loading pricing..." />
      </div>
    );
  }

  const getPlanPrice = (plan: Plan) => {
    return currency === "INR" ? plan.price.inr : plan.price.usd;
  };

  const getCurrentPlans = () => {
    return billingInterval === "yearly" ? YEARLY_PLANS : PLANS;
  };

  const getPlanIcon = (planType: PlanType) => {
    switch (planType) {
      case "free":
        return <Users className="h-8 w-8 text-green-500" />;
      case "premium":
        return <Star className="h-8 w-8 text-blue-500" />;
      case "enterprise":
        return <Shield className="h-8 w-8 text-purple-500" />;
      default:
        return <Zap className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFeatureIcon = (feature: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      subscriptions: <CreditCard className="h-4 w-4" />,
      analytics: <BarChart3 className="h-4 w-4" />,
      reminders: <Bell className="h-4 w-4" />,
      export: <Download className="h-4 w-4" />,
      support: <Users className="h-4 w-4" />,
      api: <Globe className="h-4 w-4" />,
    };
    return iconMap[feature] || <Check className="h-4 w-4" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upgrade your subscription management with powerful features and
          unlimited tracking.
        </p>
        
        {/* Currency Display */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">
            Prices shown in: <span className="font-medium">{currency === "INR" ? "Indian Rupees (₹)" : "US Dollars ($)"}</span>
          </span>
        </div>

        {/* Billing Interval Toggle */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Billing:</span>
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setBillingInterval("monthly")}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  billingInterval === "monthly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval("yearly")}
                className={`px-4 py-2 rounded text-sm font-medium transition-all relative ${
                  billingInterval === "yearly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  Save
                </span>
              </button>
            </div>
          </div>
        </div>


      </div>

      {/* Pricing Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
        {getCurrentPlans().map((plan) => {
          const features = PLAN_FEATURES[plan.type] || [];
          const price = getPlanPrice(plan);
          const isPopular = plan.type === "premium";

          return (
            <Card
              key={plan.type}
              className={`relative ${
                isPopular
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  {getPlanIcon(plan.type)}
                </div>
                <div>
                  <CardTitle className="text-2xl capitalize">
                    {plan.name}
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {price === 0 ? (
                      "Free"
                    ) : (
                      <>
                        {currency === "INR" ? "₹" : "$"}
                        {price}
                        <span className="text-lg text-muted-foreground font-normal">
                          /{billingInterval === "yearly" ? "year" : "month"}
                        </span>
                      </>
                    )}
                  </div>
                  {price > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Billed {billingInterval} • Cancel anytime
                      {billingInterval === "yearly" && (
                        <span className="block text-green-600 dark:text-green-400 font-medium">
                          {billingInterval === "yearly" &&
                            plan.type === "premium" &&
                            currency === "USD" &&
                            "Save $3.89/month"}
                          {billingInterval === "yearly" &&
                            plan.type === "premium" &&
                            currency === "INR" &&
                            "Save ₹29/month"}
                          {billingInterval === "yearly" &&
                            plan.type === "enterprise" &&
                            currency === "USD" &&
                            "Save $3.89/month"}
                          {billingInterval === "yearly" &&
                            plan.type === "enterprise" &&
                            currency === "INR" &&
                            "Save ₹39/month"}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Auto-fetch highlight for Premium and Enterprise */}
                {(plan.type === "premium" || plan.type === "enterprise") && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                      <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                      Coming Soon: Auto-fetch Subscriptions
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      AI-powered email scanning to automatically detect and
                      import your subscriptions
                    </p>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className={`flex-shrink-0 ${
                          feature.includes("Coming Soon")
                            ? "text-blue-500"
                            : "text-green-500"
                        }`}
                      >
                        {feature.includes("Coming Soon") ? (
                          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                        ) : (
                          getFeatureIcon(
                            feature.toLowerCase().replace(/[^a-z]/g, ""),
                          )
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          feature.includes("Coming Soon")
                            ? "text-blue-700 dark:text-blue-300 font-medium"
                            : ""
                        }`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  variant={isPopular ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handlePlanSelect(plan.type)}
                  disabled={isProcessing || selectedPlan === plan.type}
                >
                  {selectedPlan === plan.type ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  {plan.type === "free" ? "Get Started" : "Upgrade Now"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Provider Info */}
      {paymentConfig && (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Secure payments powered by{" "}
            <span className="font-medium capitalize">
              {paymentConfig.provider}
            </span>
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              SSL Encrypted
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              All Major Cards
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Global Support
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto space-y-8 pt-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Can I change plans anytime?
            </h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes
              take effect immediately, and you'll be charged or credited
              proportionally.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              What payment methods do you accept?
            </h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, debit cards, and digital wallets
              through Stripe (global) and Razorpay (India).
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Is there a free trial?</h3>
            <p className="text-muted-foreground">
              Our Free plan gives you access to core features with limits. You
              can upgrade anytime to unlock unlimited subscriptions and advanced
              features.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">How secure is my data?</h3>
            <p className="text-muted-foreground">
              Your data is encrypted at rest and in transit. We use
              industry-standard security practices and never store your payment
              information directly.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modals */}
      {selectedPlanForPayment && (
        <>
          {isStripeAvailable && (
            <React.Suspense fallback={<LoadingSpinner />}>
              <StripePaymentModal
                isOpen={showStripeModal}
                onClose={() => {
                  setShowStripeModal(false);
                  setSelectedPlanForPayment(null);
                  setPlanLoading(false);
                }}
                planType={selectedPlanForPayment}
                currency={currency}
                billingInterval={billingInterval}
              />
            </React.Suspense>
          )}

          <RazorpayPaymentModal
            isOpen={showRazorpayModal}
            onClose={() => {
              setShowRazorpayModal(false);
              setSelectedPlanForPayment(null);
              setPlanLoading(false);
            }}
            planType={selectedPlanForPayment}
            billingInterval={billingInterval}
          />
        </>
      )}
    </div>
  );
};

export default Pricing;
