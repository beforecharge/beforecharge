import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePayment } from "@/hooks/usePayment";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { PLAN_LIMITS } from "@/lib/constants";
import { PlanType } from "@/types/payment.types";
import toast from "react-hot-toast";

interface SubscriptionLimitInfo {
  current: number;
  limit: number | "unlimited";
  percentage: number;
  canAddMore: boolean;
  remaining: number | "unlimited";
}

interface UpgradeInfo {
  shouldShow: boolean;
  title: string;
  message: string;
  currentPlan: PlanType;
  suggestedPlan: PlanType;
  benefits: string[];
}

interface UseSubscriptionLimitsReturn {
  isLoading: boolean;
  userPlan: { type: PlanType; expires_at?: string } | null;
  limitInfo: SubscriptionLimitInfo;
  upgradeInfo: UpgradeInfo;
  checkCanAddSubscription: () => boolean;
  checkCanAddMultipleSubscriptions: (count: number) => boolean;
  getUpgradeMessage: (action?: string) => string;
  handleUpgradePrompt: () => void;
  refreshPlanData: () => Promise<void>;
}

export const useSubscriptionLimits = (): UseSubscriptionLimitsReturn => {
  const { user } = useAuth();
  const { getUserPlan } = usePayment();
  const { subscriptions } = useSubscriptions();

  const [isLoading, setIsLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<{
    type: PlanType;
    expires_at?: string;
  } | null>(null);

  // Load user plan data
  const refreshPlanData = useCallback(async () => {
    if (!user) {
      setUserPlan(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const plan = await getUserPlan();
      setUserPlan(plan);
    } catch (error) {
      console.error("Error fetching user plan:", error);
      setUserPlan({ type: "free" }); // Default to free on error
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load plan data on mount and when user changes
  useEffect(() => {
    refreshPlanData();
  }, [user]);

  // Calculate subscription limit information
  const limitInfo: SubscriptionLimitInfo = useMemo(() => {
    if (!userPlan) {
      return {
        current: 0,
        limit: 5,
        percentage: 0,
        canAddMore: false,
        remaining: 5,
      };
    }

    const activeSubscriptions = subscriptions.filter((sub) => sub.is_active);
    const current = activeSubscriptions.length;
    const limit = PLAN_LIMITS[userPlan.type].subscriptions;

    let percentage: number;
    let canAddMore: boolean;
    let remaining: number | "unlimited";

    if (limit === "unlimited") {
      percentage = 0; // No limit, so no percentage
      canAddMore = true;
      remaining = "unlimited";
    } else {
      percentage = (current / limit) * 100;
      canAddMore = current < limit;
      remaining = Math.max(0, limit - current);
    }

    return {
      current,
      limit,
      percentage,
      canAddMore,
      remaining,
    };
  }, [userPlan, subscriptions]);

  // Generate upgrade information
  const upgradeInfo: UpgradeInfo = useMemo(() => {
    if (!userPlan) {
      return {
        shouldShow: false,
        title: "",
        message: "",
        currentPlan: "free",
        suggestedPlan: "premium",
        benefits: [],
      };
    }

    const shouldShow = !limitInfo.canAddMore;
    let suggestedPlan: PlanType = "premium";
    let benefits: string[] = [];

    if (userPlan.type === "free") {
      suggestedPlan = "premium";
      benefits = [
        "Up to 15 subscriptions",
        "Advanced analytics & insights",
        "Smart reminders",
        "Receipt upload",
      ];
    } else if (userPlan.type === "premium") {
      suggestedPlan = "enterprise";
      benefits = [
        "Unlimited subscriptions",  
        "Everything in Premium",
        "Custom integrations",
        "Advanced reporting",
      ];
    }

    return {
      shouldShow,
      title: shouldShow ? "Subscription Limit Reached" : "",
      message: shouldShow
        ? `You've reached your limit of ${limitInfo.limit} subscriptions on the ${userPlan.type} plan.`
        : "",
      currentPlan: userPlan.type,
      suggestedPlan,
      benefits,
    };
  }, [userPlan, limitInfo]);

  // Check if user can add a single subscription
  const checkCanAddSubscription = useCallback((): boolean => {
    if (isLoading) return false;
    return limitInfo.canAddMore;
  }, [isLoading, limitInfo.canAddMore]);

  // Check if user can add multiple subscriptions
  const checkCanAddMultipleSubscriptions = useCallback(
    (count: number): boolean => {
      if (isLoading) return false;

      if (limitInfo.limit === "unlimited") return true;

      const wouldExceedLimit =
        limitInfo.current + count > (limitInfo.limit as number);
      return !wouldExceedLimit;
    },
    [isLoading, limitInfo],
  );

  // Get contextual upgrade message
  const getUpgradeMessage = useCallback(
    (action: string = "perform this action"): string => {
      if (!userPlan) return `Please upgrade to ${action}.`;

      const limit = limitInfo.limit;
      const current = limitInfo.current;

      if (limit === "unlimited") return "";

      if (current >= (limit as number)) {
        return `You've reached your limit of ${limit} subscriptions. Upgrade to ${upgradeInfo.suggestedPlan} to ${action}.`;
      }

      const remaining = (limit as number) - current;
      if (remaining <= 2) {
        return `You're approaching your limit (${current}/${limit} subscriptions). Consider upgrading for unlimited access.`;
      }

      return "";
    },
    [userPlan, limitInfo, upgradeInfo.suggestedPlan],
  );

  // Handle upgrade prompt
  const handleUpgradePrompt = useCallback(() => {
    if (!upgradeInfo.shouldShow) return;

    const message = `${upgradeInfo.message} Upgrade to ${upgradeInfo.suggestedPlan} for more subscriptions!`;

    toast.error(message, {
      duration: 8000,
      position: "top-right",
    });
  }, [upgradeInfo]);

  return {
    isLoading,
    userPlan,
    limitInfo,
    upgradeInfo,
    checkCanAddSubscription,
    checkCanAddMultipleSubscriptions,
    getUpgradeMessage,
    handleUpgradePrompt,
    refreshPlanData,
  };
};

export default useSubscriptionLimits;
