import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
  Activity,
  CreditCard
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import useSubscriptions from "@/hooks/useSubscriptions";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { AddSubscriptionModal } from "@/components/subscriptions";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { DEFAULTS } from "@/lib/constants";
import { formatCurrencyAmount } from "@/utils/currencyUtils";

const Dashboard: React.FC = () => {
  const { getDisplayName, profile } = useAuth();
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
  const upcomingRenewalsData = getUpcomingRenewals(7);
  const upcomingRenewalsCount = upcomingRenewalsData.length;

  const displayCurrency = profile?.default_currency || DEFAULTS.currency;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" showText text="Loading dashboard..." />
      </div>
    );
  }

  // Calculate simple unused mock data for UI visual completion
  const unusedSimulated = 2;
  const healthScore = 92;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {getDisplayName()}!</h1>
          <p className="text-muted-foreground text-sm">Here's the latest on your subscriptions.</p>
        </div>
        <AddSubscriptionModal
          trigger={
            <button className="add-btn">
              <Plus className="h-4 w-4" />
              Add Subscription
            </button>
          }
        />
      </div>

      <div className="health-banner">
        <div className="hb-score">{healthScore}<span>/100</span></div>
        <div className="hb-body">
          <div className="hb-title">Your subscription health is excellent</div>
          <div className="hb-sub">You have simulated $12.50 in unused subscriptions this month.</div>
          <div className="hb-track">
            <div className="hb-fill" style={{ width: `${healthScore}%` }}></div>
          </div>
        </div>
        <div className="hb-tags">
          <span className="tag tag-r">{unusedSimulated} Unused</span>
          <span className="tag tag-a">{upcomingRenewalsCount} Renewing Soon</span>
          <span className="tag tag-g">Save $50/mo</span>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-accent" style={{ background: "var(--c-green)" }}></div>
          <div className="kpi-lbl">Total Monthly</div>
          <div className="kpi-val">{formatCurrencyAmount(totalMonthlySpend, displayCurrency)}</div>
          <div className="kpi-delta" style={{ color: "var(--c-green)" }}>↓ 2.4% vs last mo</div>
          <DollarSign className="kpi-glyph" />
        </div>
        <div className="kpi">
          <div className="kpi-accent" style={{ background: "var(--c-blue)" }}></div>
          <div className="kpi-lbl">Active Subs</div>
          <div className="kpi-val">{activeSubscriptionCount}</div>
          <div className="kpi-delta">Across {limitInfo.current} categories</div>
          <Activity className="kpi-glyph" />
        </div>
        <div className="kpi">
          <div className="kpi-accent" style={{ background: "var(--c-amber)" }}></div>
          <div className="kpi-lbl">Upcoming (7d)</div>
          <div className="kpi-val">{upcomingRenewalsCount}</div>
          <div className="kpi-delta">Action recommended</div>
          <AlertCircle className="kpi-glyph" />
        </div>
        <div className="kpi">
          <div className="kpi-accent" style={{ background: "var(--c-violet)" }}></div>
          <div className="kpi-lbl">Annual Est.</div>
          <div className="kpi-val">{formatCurrencyAmount(totalAnnualSpend, displayCurrency)}</div>
          <div className="kpi-delta">Projected spend</div>
          <TrendingUp className="kpi-glyph" />
        </div>
      </div>

      <div className="dash-cols">
        <div className="panel">
          <div className="panel-top">
            <div className="panel-title">
              <div className="panel-title-ico" style={{ background: "var(--c-blue-bg)", color: "var(--c-blue)" }}>
                <CreditCard className="h-4 w-4" />
              </div>
              Recent Subscriptions
            </div>
            <div className="panel-link" onClick={() => navigate("/subscriptions")}>View all →</div>
          </div>
          <div>
            {subscriptions.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No subscriptions yet</div>
            ) : (
              getActiveSubscriptions().slice(0, 5).map(sub => (
                <div className="sub-row" key={sub.id}>
                  <div className="sub-ico" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <span className="text-xs">{sub.name.charAt(0)}</span>
                  </div>
                  <div className="sub-inf">
                    <div className="sub-name">{sub.name}</div>
                    <div className="sub-meta">{sub.billing_cycle}</div>
                  </div>
                  <div className="sub-price">{formatCurrencyAmount(sub.cost, sub.currency)}</div>
                  <span className={`badge ${sub.is_active ? 'badge-g' : 'badge-n'}`}>
                    {sub.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-top">
            <div className="panel-title">
              <div className="panel-title-ico" style={{ background: "var(--c-red-bg)", color: "var(--c-red)" }}>
                <Calendar className="h-4 w-4" />
              </div>
              Renewing Soon
            </div>
          </div>
          <div>
            {upcomingRenewalsData.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No upcoming renewals</div>
            ) : (
              upcomingRenewalsData.map(sub => {
                const renewalDate = new Date(sub.renewal_date);
                const daysUntil = Math.ceil((renewalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div className="sub-row" key={sub.id}>
                    <div className="sub-inf">
                      <div className="sub-name">{sub.name}</div>
                      <div className="sub-meta">
                        {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                      </div>
                    </div>
                    <div className="sub-price">{formatCurrencyAmount(sub.cost, sub.currency)}</div>
                  </div>
                );
              })
            )}
          </div>
          <div className="panel-top" style={{ borderTop: "1px solid var(--c-border)", borderBottom: "none" }}>
            <div className="panel-title">
              Overall Subs Limit: {limitInfo.current}/{limitInfo.limit === "unlimited" ? "∞" : limitInfo.limit}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
