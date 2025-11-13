import React from "react";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
} from "lucide-react";

import useSubscriptions from "@/hooks/useSubscriptions";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";

const Analytics: React.FC = () => {
  const {
    categories,
    isLoading,
    getTotalMonthlyCost,
    getTotalAnnualCost,
    getActiveSubscriptions,
  } = useSubscriptions();

  const activeSubscriptions = getActiveSubscriptions();
  const totalMonthlySpend = getTotalMonthlyCost();
  const totalAnnualSpend = getTotalAnnualCost();
  const averagePerService =
    activeSubscriptions.length > 0
      ? totalMonthlySpend / activeSubscriptions.length
      : 0;
  const mostExpensive = activeSubscriptions.reduce(
    (max, sub) => (sub.cost > max.cost ? sub : max),
    { cost: 0, name: "None" },
  );

  // Get category spending data
  const getCategorySpending = () => {
    const categoryMap = new Map();

    activeSubscriptions.forEach((sub) => {
      const category = categories.find((cat) => cat.id === sub.category_id);
      const categoryName = category?.name || "Unknown";
      const categoryColor = category?.color || "#64748b";

      if (categoryMap.has(categoryName)) {
        categoryMap.get(categoryName).amount += sub.cost;
        categoryMap.get(categoryName).count += 1;
      } else {
        categoryMap.set(categoryName, {
          amount: sub.cost,
          count: 1,
          color: categoryColor,
        });
      }
    });

    return Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        category: name,
        amount: data.amount,
        percentage:
          totalMonthlySpend > 0 ? (data.amount / totalMonthlySpend) * 100 : 0,
        color: data.color,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const categorySpending = getCategorySpending();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" showText text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Insights and trends for your subscription spending
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Spending
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalMonthlySpend.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current monthly spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Annual Projection
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalAnnualSpend.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average per Service
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${averagePerService.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {activeSubscriptions.length} active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Expensive
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mostExpensive.cost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostExpensive.name}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
            <CardDescription>
              Monthly subscription costs over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center space-y-2">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Line chart coming soon
                </p>
                <p className="text-xs text-muted-foreground">
                  Will show 6-month spending trend
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Spending distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center space-y-2">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Pie chart coming soon
                </p>
                <p className="text-xs text-muted-foreground">
                  Will show category spending distribution
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Details */}
      <Card>
        <CardHeader>
          <CardTitle>Category Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of spending by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categorySpending.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No subscription data available
              </p>
            ) : (
              categorySpending.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.category}</span>
                    <span className="text-xs text-muted-foreground">
                      ({item.count})
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: item.color,
                          width: `${Math.max(item.percentage, 2)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      ${item.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cost Optimization */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization</CardTitle>
          <CardDescription>
            Recommendations to reduce your subscription costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSubscriptions.filter(
              (sub) => sub.billing_cycle === "monthly",
            ).length > 0 && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Annual vs Monthly Savings</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Consider switching monthly subscriptions to annual billing
                      for potential savings
                    </p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {
                      activeSubscriptions.filter(
                        (sub) => sub.billing_cycle === "monthly",
                      ).length
                    }{" "}
                    opportunities
                  </span>
                </div>
              </div>
            )}

            {totalMonthlySpend > 0 && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <PieChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Monthly Budget Overview</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      You're spending ${totalMonthlySpend.toFixed(2)} per month
                      across {activeSubscriptions.length} subscriptions
                    </p>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    ${totalAnnualSpend.toFixed(2)}/year
                  </span>
                </div>
              </div>
            )}

            {activeSubscriptions.length === 0 && (
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  No active subscriptions to analyze. Add some subscriptions to
                  see optimization insights.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
