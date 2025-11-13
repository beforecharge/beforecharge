import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import useSubscriptions from "@/hooks/useSubscriptions";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { AddSubscriptionModal } from "@/components/subscriptions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/loading-spinner";

const Dashboard: React.FC = () => {
  const { getDisplayName } = useAuth();
  const navigate = useNavigate();
  const {
    subscriptions,
    isLoading,
    getTotalMonthlyCost,
    getTotalAnnualCost,
    getActiveSubscriptions,
    getUpcomingRenewals,
  } = useSubscriptions();

  const { limitInfo } = useSubscriptionLimits();

  const totalMonthlySpend = getTotalMonthlyCost();
  const totalAnnualSpend = getTotalAnnualCost();
  const activeSubscriptionCount = getActiveSubscriptions().length;
  const upcomingRenewalsData = getUpcomingRenewals(7); // Next 7 days
  const upcomingRenewalsCount = upcomingRenewalsData.length;

  const handleReviewRenewals = () => {
    navigate("/subscriptions");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" showText text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {getDisplayName()}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your subscriptions today.
          </p>
        </div>
        <AddSubscriptionModal
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subscription
            </Button>
          }
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalMonthlySpend.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalAnnualSpend.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Projected yearly cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptionCount}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subscription Limit
            </CardTitle>
            {limitInfo.canAddMore ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {limitInfo.current}/
              {limitInfo.limit === "unlimited" ? "∞" : limitInfo.limit}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {limitInfo.limit === "unlimited"
                  ? "Unlimited"
                  : `${limitInfo.remaining} remaining`}
              </p>
              {!limitInfo.canAddMore && (
                <Badge variant="warning" className="text-xs">
                  Limit reached
                </Badge>
              )}
            </div>
            {limitInfo.limit !== "unlimited" && (
              <div className="mt-2 w-full bg-muted rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    limitInfo.percentage >= 100
                      ? "bg-red-500"
                      : limitInfo.percentage >= 80
                        ? "bg-orange-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(limitInfo.percentage, 100)}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Renewals
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingRenewalsCount}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Subscriptions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Subscriptions</CardTitle>
            <CardDescription>
              Your latest subscription activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No subscriptions yet
                  </p>
                  <AddSubscriptionModal
                    trigger={
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="mr-2 h-3 w-3" />
                        Add Your First Subscription
                      </Button>
                    }
                  />
                </div>
              ) : (
                getActiveSubscriptions()
                  .slice(0, 3)
                  .map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {subscription.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {subscription.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {subscription.description || "No description"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${subscription.cost.toFixed(2)}/
                          {subscription.billing_cycle === "monthly"
                            ? "mo"
                            : "yr"}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals</CardTitle>
            <CardDescription>Subscriptions renewing soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingRenewalsData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming renewals in the next 7 days
                </p>
              ) : (
                upcomingRenewalsData.map((subscription) => {
                  const renewalDate = new Date(subscription.renewal_date);
                  const daysUntil = Math.ceil(
                    (renewalDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24),
                  );

                  return (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {subscription.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {daysUntil === 0
                              ? "Today"
                              : daysUntil === 1
                                ? "Tomorrow"
                                : `In ${daysUntil} days`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${subscription.cost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your subscriptions efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <AddSubscriptionModal
              trigger={
                <Button variant="outline" className="h-20 flex-col">
                  <Plus className="h-6 w-6 mb-2" />
                  Add New Subscription
                </Button>
              }
            />
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => navigate("/analytics")}
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={handleReviewRenewals}
            >
              <AlertCircle className="h-6 w-6 mb-2" />
              Review Renewals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
