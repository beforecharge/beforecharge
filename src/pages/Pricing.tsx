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
    const detectUserLocation = () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isIndianTimezone = timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta');

      const userIsIndian =
        profile?.default_currency === "INR" ||
        paymentConfig?.provider === "razorpay" ||
        isIndianTimezone;

      setCurrency(userIsIndian ? "INR" : "USD");
    };

    detectUserLocation();
  }, [profile, paymentConfig]);

  useEffect(() => {
    const stripeKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY;
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
        return <Star className="h-8 w-8 text-primary" />;
      case "enterprise":
        return <Shield className="h-8 w-8 text-purple-500" />;
      default:
        return <Zap className="h-8 w-8 text-muted-foreground" />;
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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4 pt-8">
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
            <div className="flex bg-black/50 border border-white/10 rounded-lg p-1">
              <button
                onClick={() => setBillingInterval("monthly")}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${billingInterval === "monthly"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white"
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval("yearly")}
                className={`px-4 py-2 rounded text-sm font-medium transition-all relative ${billingInterval === "yearly"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white"
                  }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-primary text-black font-bold text-xs.5 px-1.5 py-0.5 rounded-sm">
                  Save
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {getCurrentPlans().map((plan) => {
          const features = PLAN_FEATURES[plan.type] || [];
          const price = getPlanPrice(plan);
          const isPopular = plan.type === "premium";

          return (
            <div
              key={plan.type}
              className={`panel relative flex flex-col ${isPopular
                  ? "border-primary/50 shadow-[0_0_30px_rgba(204,255,0,0.1)] md:scale-105 z-10"
                  : ""
                }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-black font-bold border-none px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="p-6 text-center space-y-4 border-b border-white/5">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.type)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold capitalize">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {plan.description}
                  </p>
                </div>
                <div className="py-2">
                  <div className="text-4xl font-bold">
                    {price === 0 ? (
                      "Free"
                    ) : (
                      <>
                        {currency === "INR" ? "₹" : "$"}
                        {price}
                        <span className="text-lg text-muted-foreground font-normal">
                          /{billingInterval === "yearly" ? "year" : "mo"}
                        </span>
                      </>
                    )}
                  </div>
                  {price > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Billed {billingInterval} • Cancel anytime
                      {billingInterval === "yearly" && (
                        <span className="block text-primary font-medium mt-1">
                          2 months free (vs monthly)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Auto-fetch highlight for Premium and Enterprise */}
                {(plan.type === "premium" || plan.type === "enterprise") && (
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 text-left">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                      Coming Soon: Auto-fetch
                    </div>
                    <p className="text-xs text-primary/70 mt-1">
                      AI-powered email scanning to automatically detect and
                      import your subscriptions
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6 flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                  {features.map((feature, index) => {
                    const isComingSoon = feature.includes("Coming Soon");
                    const iconColor = isComingSoon ? "text-primary/70" : "text-primary";
                    const textColor = isComingSoon ? "text-primary/70 font-medium" : "text-muted-foreground";

                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`flex-shrink-0 ${iconColor}`}>
                          {isComingSoon ? (
                            <span className="flex h-2 w-2 rounded-full bg-primary/70 animate-pulse"></span>
                          ) : (
                            getFeatureIcon(feature.toLowerCase().replace(/[^a-z]/g, ""))
                          )}
                        </div>
                        <span className={`text-sm ${textColor}`}>
                          {feature}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Button
                  size="lg"
                  className={`w-full ${isPopular ? "bg-primary text-black hover:bg-primary/90" : "bg-white/10 text-white hover:bg-white/20"}`}
                  onClick={() => handlePlanSelect(plan.type)}
                  disabled={isProcessing || selectedPlan === plan.type}
                >
                  {selectedPlan === plan.type ? (
                    <LoadingSpinner size="sm" className={`mr-2 ${isPopular ? "border-black" : "border-white"}`} />
                  ) : null}
                  {plan.type === "free" ? "Get Started" : "Upgrade Now"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Provider Info */}
      {paymentConfig && (
        <div className="text-center space-y-2 pt-8">
          <p className="text-sm text-muted-foreground">
            Secure payments powered by{" "}
            <span className="font-medium capitalize text-white">
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
      <div className="max-w-4xl mx-auto space-y-8 pt-16 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="panel p-6">
            <h3 className="text-lg font-semibold mb-2">
              Can I change plans anytime?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yes, you can upgrade or downgrade your plan at any time. Changes
              take effect immediately, and you'll be charged or credited
              proportionally.
            </p>
          </div>

          <div className="panel p-6">
            <h3 className="text-lg font-semibold mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We accept all major credit cards, debit cards, and digital wallets
              through Stripe (global) and Razorpay (India).
            </p>
          </div>

          <div className="panel p-6">
            <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our Free plan gives you access to core features with limits. You
              can upgrade anytime to unlock unlimited subscriptions and advanced
              features.
            </p>
          </div>

          <div className="panel p-6">
            <h3 className="text-lg font-semibold mb-2">How secure is my data?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your data is encrypted at rest and in transit. We use
              industry-standard security practices and never store your payment
              information directly in our databases.
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
