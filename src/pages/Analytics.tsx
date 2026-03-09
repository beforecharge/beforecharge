import React from "react";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Activity
} from "lucide-react";

import useSubscriptions from "@/hooks/useSubscriptions";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { DEFAULTS } from "@/lib/constants";
import { convertCurrency, formatCurrencyAmount } from "@/utils/currencyUtils";

const Analytics: React.FC = () => {
  const {
    categories,
    isLoading,
    getTotalMonthlyCost,
    getTotalAnnualCost,
    getActiveSubscriptions,
  } = useSubscriptions();

  const { profile } = useAuth();
  const activeSubscriptions = getActiveSubscriptions();
  const totalMonthlySpend = getTotalMonthlyCost();
  const totalAnnualSpend = getTotalAnnualCost();
  const displayCurrency = profile?.default_currency || DEFAULTS.currency;

  const averagePerService =
    activeSubscriptions.length > 0
      ? totalMonthlySpend / activeSubscriptions.length
      : 0;

  const mostExpensive =
    activeSubscriptions.length > 0
      ? activeSubscriptions.reduce((max, sub) => {
        const maxConverted = convertCurrency(
          max.cost,
          max.currency,
          displayCurrency,
        );
        const subConverted = convertCurrency(
          sub.cost,
          sub.currency,
          displayCurrency,
        );
        return subConverted > maxConverted ? sub : max;
      })
      : null;

  const getCategorySpending = () => {
    const categoryMap = new Map();

    activeSubscriptions.forEach((sub) => {
      const category = categories.find((cat) => cat.id === sub.category_id);
      const categoryName = category?.name || "Unknown";
      const categoryColor = category?.color || "#64748b";

      const converted = convertCurrency(
        sub.cost,
        sub.currency,
        displayCurrency,
      );

      if (categoryMap.has(categoryName)) {
        categoryMap.get(categoryName).amount += converted;
        categoryMap.get(categoryName).count += 1;
      } else {
        categoryMap.set(categoryName, {
          amount: converted,
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Insights and trends for your subscription spending</p>
        </div>
      </div>

      <div className="kpi-grid mb-6">
        <div className="kpi">
          <div className="kpi-accent" style={{ background: "var(--c-green)" }}></div>
          <div className="kpi-lbl">Monthly Spend</div>
          <div className="kpi-val">{formatCurrencyAmount(totalMonthlySpend, displayCurrency)}</div>
          <DollarSign className="kpi-glyph" />
        </div>
        <div className="kpi">
          <div className="kpi-accent" style={{ background: "var(--c-violet)" }}></div>
          <div className="kpi-lbl">Annual Projection</div>
          <div className="kpi-val">{formatCurrencyAmount(totalAnnualSpend, displayCurrency)}</div>
          <TrendingUp className="kpi-glyph" />
        </div>
        <div className="kpi">
          <div className="kpi-accent" style={{ background: "var(--c-amber)" }}></div>
          <div className="kpi-lbl">Avg. per Service</div>
          <div className="kpi-val">{formatCurrencyAmount(averagePerService, displayCurrency)}</div>
          <PieChart className="kpi-glyph" />
        </div>
        <div className="kpi">
          <div className="kpi-accent" style={{ background: "var(--c-red)" }}></div>
          <div className="kpi-lbl">Most Expensive</div>
          <div className="kpi-val text-xl">
            {mostExpensive
              ? formatCurrencyAmount(mostExpensive.cost, mostExpensive.currency)
              : formatCurrencyAmount(0, displayCurrency)}
            <span className="text-sm font-normal text-muted-foreground ml-1">{mostExpensive?.name ?? ""}</span>
          </div>
          <BarChart3 className="kpi-glyph" />
        </div>
      </div>

      <div className="dash-cols">
        <div className="panel flex-1">
          <div className="panel-top">
            <div className="panel-title">
              <div className="panel-title-ico" style={{ background: "var(--c-blue-bg)", color: "var(--c-blue)" }}>
                <PieChart className="h-4 w-4" />
              </div>
              Category Breakdown
            </div>
          </div>
          <div className="p-4 space-y-4">
            {categorySpending.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No subscription data available</p>
            ) : (
              categorySpending.map((item) => (
                <div key={item.category} className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3 w-1/3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-sm">{item.category}</span>
                    <span className="text-xs text-muted-foreground">({item.count})</span>
                  </div>
                  <div className="flex items-center space-x-4 flex-1 justify-end">
                    <div className="w-full sm:w-32 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: item.color,
                          width: `${Math.max(item.percentage, 2)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-20 text-right">
                      {formatCurrencyAmount(item.amount, displayCurrency)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-top">
            <div className="panel-title">
              <div className="panel-title-ico" style={{ background: "var(--c-green-bg)", color: "var(--c-green)" }}>
                <Activity className="h-4 w-4" />
              </div>
              Cost Optimization
            </div>
          </div>
          <div>
            {activeSubscriptions.filter(sub => sub.billing_cycle === "monthly").length > 0 && (
              <div className="sub-row">
                <div className="sub-ico text-yellow-500" style={{ background: "var(--c-amber-bg)", color: "var(--c-amber)" }}>
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="sub-inf">
                  <div className="sub-name">Annual vs Monthly</div>
                  <div className="sub-meta">Consider switching to annual billing</div>
                </div>
                <div className="sub-price text-blue-500">
                  {activeSubscriptions.filter(sub => sub.billing_cycle === "monthly").length} opportunities
                </div>
              </div>
            )}
            {totalMonthlySpend > 0 && (
              <div className="sub-row">
                <div className="sub-ico" style={{ background: "var(--c-blue-bg)", color: "var(--c-blue)" }}>
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="sub-inf">
                  <div className="sub-name">Budget Overview</div>
                  <div className="sub-meta">{activeSubscriptions.length} subscriptions tracked</div>
                </div>
                <div className="sub-price text-green-500">
                  {formatCurrencyAmount(totalAnnualSpend, displayCurrency)}/yr
                </div>
              </div>
            )}
            {activeSubscriptions.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No active subscriptions to analyze.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
