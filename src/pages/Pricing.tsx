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
  AlertCircle,
  Package,
  DollarSign,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePayment } from "@/hooks/usePayment";
import { PLANS, YEARLY_PLANS, PLAN_FEATURES } from "@/lib/constants";
import { Plan, PlanType } from "@/types/payment.types";
import { trackEvent, ANALYTICS_EVENTS } from "@/utils/analytics";
import { LemonSqueezyPaymentModal } from "@/components/payment";

// Subscription category data with real averages
const SUBSCRIPTION_DATA = {
  streaming: { cost: 14.99, forgetRate: 0.22, label: "Streaming" },
  cloud: { cost: 9.99, forgetRate: 0.31, label: "Cloud storage" },
  music: { cost: 10.99, forgetRate: 0.18, label: "Music" },
  news: { cost: 12.99, forgetRate: 0.44, label: "News/magazines" },
  fitness: { cost: 14.99, forgetRate: 0.38, label: "Fitness/health" },
  productivity: { cost: 16.00, forgetRate: 0.29, label: "Productivity tools" },
  gaming: { cost: 14.99, forgetRate: 0.26, label: "Gaming" },
};

// Subscription Waste Estimator Component
const SubscriptionWasteEstimator: React.FC<{ currency: "USD" | "INR"; billingInterval: "monthly" | "yearly" }> = ({ currency, billingInterval }) => {
  const [streamingCount, setStreamingCount] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [freeTrialFrequency, setFreeTrialFrequency] = useState<string>("");
  const [showResults, setShowResults] = useState(false);

  const currencySymbol = currency === "INR" ? "₹" : "$";
  const conversionRate = currency === "INR" ? 83 : 1; // Approximate USD to INR
  
  const personalPlanPrice = billingInterval === "yearly" 
    ? (currency === "INR" ? 699 : 69.99) 
    : (currency === "INR" ? 69 : 6.99);
  const personalPlanYearlyCost = billingInterval === "yearly" 
    ? personalPlanPrice 
    : personalPlanPrice * 12;

  // Calculate estimates based on selections
  const calculateEstimate = () => {
    let totalSubs = 0;
    let monthlyCost = 0;
    let forgottenSubs = 0;
    let wastedCost = 0;

    // Streaming services
    if (streamingCount === "1-2") {
      totalSubs += 1.5;
      monthlyCost += 1.5 * SUBSCRIPTION_DATA.streaming.cost;
      forgottenSubs += 1.5 * SUBSCRIPTION_DATA.streaming.forgetRate;
      wastedCost += 1.5 * SUBSCRIPTION_DATA.streaming.cost * SUBSCRIPTION_DATA.streaming.forgetRate;
    } else if (streamingCount === "3-4") {
      totalSubs += 3.5;
      monthlyCost += 3.5 * SUBSCRIPTION_DATA.streaming.cost;
      forgottenSubs += 3.5 * SUBSCRIPTION_DATA.streaming.forgetRate;
      wastedCost += 3.5 * SUBSCRIPTION_DATA.streaming.cost * SUBSCRIPTION_DATA.streaming.forgetRate;
    } else if (streamingCount === "5+") {
      totalSubs += 6;
      monthlyCost += 6 * SUBSCRIPTION_DATA.streaming.cost;
      forgottenSubs += 6 * SUBSCRIPTION_DATA.streaming.forgetRate;
      wastedCost += 6 * SUBSCRIPTION_DATA.streaming.cost * SUBSCRIPTION_DATA.streaming.forgetRate;
    }

    // Other categories
    selectedCategories.forEach(cat => {
      const data = SUBSCRIPTION_DATA[cat as keyof typeof SUBSCRIPTION_DATA];
      if (data) {
        totalSubs += 1;
        monthlyCost += data.cost;
        forgottenSubs += data.forgetRate;
        wastedCost += data.cost * data.forgetRate;
      }
    });

    // Free trial impact
    if (freeTrialFrequency === "occasionally") {
      totalSubs += 1;
      monthlyCost += 11.50;
      forgottenSubs += 0.67;
      wastedCost += 11.50 * 0.67;
    } else if (freeTrialFrequency === "often") {
      totalSubs += 2;
      monthlyCost += 23;
      forgottenSubs += 1.34;
      wastedCost += 23 * 0.67;
    } else if (freeTrialFrequency === "always") {
      totalSubs += 3;
      monthlyCost += 34.50;
      forgottenSubs += 2;
      wastedCost += 34.50 * 0.67;
    }

    // Convert to user's currency
    monthlyCost *= conversionRate;
    wastedCost *= conversionRate;
    const annualCost = monthlyCost * 12;
    const annualWaste = wastedCost * 12;
    const netSaving = annualWaste - personalPlanYearlyCost;

    return {
      totalSubs: Math.round(totalSubs),
      monthlyCost: Math.round(monthlyCost),
      annualCost: Math.round(annualCost),
      forgottenSubs: Math.round(forgottenSubs * 10) / 10,
      annualWaste: Math.round(annualWaste),
      netSaving: Math.round(Math.max(0, netSaving)),
    };
  };

  const estimate = calculateEstimate();
  const hasSelections = streamingCount || selectedCategories.length > 0 || freeTrialFrequency;

  useEffect(() => {
    setShowResults(!!hasSelections);
  }, [hasSelections]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 my-8">
      <div className="panel p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg sm:text-xl font-bold text-center">Subscription Waste Estimator</h3>
        </div>
        
        <p className="text-center text-muted-foreground mb-8 text-xs sm:text-sm">
          Answer 3 quick questions to see how much you're likely wasting
        </p>

        <div className="space-y-8">
          {/* Question 1: Streaming Services */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-center">
              1. How many streaming services do you use?
            </label>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { value: "1-2", label: "1–2" },
                { value: "3-4", label: "3–4" },
                { value: "5+", label: "5+" },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setStreamingCount(option.value)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    streamingCount === option.value
                      ? "bg-primary text-black shadow-lg scale-105"
                      : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 text-muted-foreground hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Other Categories */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-center">
              2. Do you use any of these? (tap to select)
            </label>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Object.entries(SUBSCRIPTION_DATA).filter(([key]) => key !== "streaming").map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    selectedCategories.includes(key)
                      ? "bg-primary text-black shadow-lg"
                      : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 text-muted-foreground hover:text-white"
                  }`}
                >
                  {data.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Free Trials */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-center">
              3. Have you ever signed up for a free trial?
            </label>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { value: "occasionally", label: "Yes, occasionally" },
                { value: "often", label: "Yes, fairly often" },
                { value: "always", label: "All the time" },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setFreeTrialFrequency(option.value)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    freeTrialFrequency === option.value
                      ? "bg-primary text-black shadow-lg scale-105"
                      : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 text-muted-foreground hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {showResults && estimate.totalSubs > 0 && (
            <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <p className="text-center text-sm font-medium text-muted-foreground mb-4">
                Based on people like you, you're likely paying for:
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-black/30 border border-white/10 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-primary mb-1">
                    <Package className="h-4 w-4" />
                    <span className="text-xs font-medium">Active Subscriptions</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold">{estimate.totalSubs}</div>
                </div>

                <div className="bg-black/30 border border-white/10 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-primary mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xs font-medium">Monthly Spending</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {currencySymbol}{estimate.monthlyCost}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {currencySymbol}{estimate.annualCost}/year
                  </div>
                </div>

                <div className="bg-black/30 border border-red-500/20 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-400 mb-1">
                    <Trash2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Forgotten About</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-red-400">
                    {estimate.forgottenSubs}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">subscriptions</div>
                </div>

                <div className="bg-black/30 border border-red-500/20 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-400 mb-1">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Estimated Waste</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-red-400">
                    {currencySymbol}{estimate.annualWaste}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">per year</div>
                </div>
              </div>

              <div className="bg-primary/20 border border-primary/40 rounded-lg p-4 sm:p-5 mt-4">
                <div className="text-center space-y-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    BeforeCharge Personal costs {currencySymbol}{personalPlanYearlyCost.toFixed(0)}/year
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm sm:text-base font-semibold">You'd save:</span>
                    <span className="text-3xl sm:text-4xl font-bold text-primary">
                      {currencySymbol}{estimate.netSaving}
                    </span>
                  </div>
                  <p className="text-xs text-primary/80">
                    in the first year alone! 🎉
                  </p>
                </div>
              </div>
            </div>
          )}

          {!showResults && (
            <p className="text-center text-xs text-muted-foreground pt-4">
              Select options above to see your personalized estimate
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { paymentConfig, isConfigLoading, isProcessing } = usePayment();

  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<PlanType | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly",
  );

  useEffect(() => {
    const detectUserLocation = () => {
      const userIsIndian = profile?.default_currency === "INR";
      setCurrency(userIsIndian ? "INR" : "USD");
    };

    detectUserLocation();
  }, [profile]);

  // Load Lemon Squeezy script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.lemonsqueezy.com/js/lemon.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePlanSelect = async (planType: PlanType) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setSelectedPlan(planType);
    setSelectedPlanForPayment(planType);
    setShowPaymentModal(true);

    trackEvent(ANALYTICS_EVENTS.PLAN_SELECT, {
      plan: planType,
      billing: billingInterval
    });
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
      </div>

      {/* Subscription Waste Estimator */}
      <SubscriptionWasteEstimator currency={currency} billingInterval={billingInterval} />

      <div className="space-y-4">
        {/* Currency Display */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">
            Prices shown in: <span className="font-medium">{currency === "INR" ? "Indian Rupees (₹)" : "US Dollars ($)"}</span>
          </span>
        </div>

        {/* Billing Interval Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Billing:</span>
            <div className="flex bg-black/50 border border-white/10 rounded-lg p-1">
              <button
                onClick={() => {
                  setBillingInterval("monthly");
                  trackEvent(ANALYTICS_EVENTS.BILLING_TOGGLE, { interval: 'monthly' });
                }}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${billingInterval === "monthly"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-muted-foreground hover:text-white"
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => {
                  setBillingInterval("yearly");
                  trackEvent(ANALYTICS_EVENTS.BILLING_TOGGLE, { interval: 'yearly' });
                }}
                className={`px-4 py-2 pr-12 rounded text-sm font-medium transition-all relative ${billingInterval === "yearly"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-muted-foreground hover:text-white"
                  }`}
              >
                Yearly
                <span className="absolute top-1/2 -translate-y-1/2 right-1.5 bg-primary text-black font-bold text-[8px] px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                  Save
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 mt-16 pt-6">
        {getCurrentPlans().map((plan) => {
          const features = PLAN_FEATURES[plan.type] || [];
          const price = getPlanPrice(plan);
          const isPopular = plan.type === "premium";

          return (
            <div
              key={plan.type}
              className={`panel relative flex flex-col ${isPopular
                ? "border-primary/50 shadow-[0_0_30px_rgba(204,255,0,0.1)] md:scale-105"
                : ""
                }`}
              style={{ zIndex: isPopular ? 10 : 1 }}
            >
              {isPopular && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center z-20">  
                  <Badge className="bg-primary text-black font-bold border-none px-5 py-1.5 shadow-lg whitespace-nowrap text-sm">
                    ⭐ Most Popular
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
                      <Zap className="h-4 w-4 flex-shrink-0 fill-primary" />
                      <span>Auto-fetch Included</span>
                    </div>
                    <p className="text-xs text-primary/70 mt-1 leading-relaxed">
                      AI-powered email scanning finds and imports subscriptions automatically
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6 flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                  {features.map((feature, index) => {
                    const isComingSoon = false;
                    const iconColor = "text-primary";
                    const textColor = "text-muted-foreground";

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

      {/* Payment Modal */}
      {selectedPlanForPayment && (
        <LemonSqueezyPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlanForPayment(null);
            setPlanLoading(false);
          }}
          planType={selectedPlanForPayment}
          currency={currency}
          billingInterval={billingInterval}
        />
      )}
    </div>
  );
};

export default Pricing;
