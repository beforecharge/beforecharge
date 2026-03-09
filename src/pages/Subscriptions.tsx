import React, { useState } from "react";
import {
  Search,
  DollarSign,
  Edit,
  Trash2,
  Tag,
  CreditCard,
  Plus
} from "lucide-react";
import {
  AddSubscriptionModal,
  AutoFetchButton,
} from "@/components/subscriptions";
import { formatCurrencyAmount } from "@/utils/currencyUtils";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import useSubscriptions from "@/hooks/useSubscriptions";
import { DEFAULTS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

const getDaysUntilRenewal = (renewalDate: string) => {
  const renewal = new Date(renewalDate);
  const now = new Date();
  const diffTime = renewal.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `${diffDays} days`;
};

const Subscriptions: React.FC = () => {
  const { profile } = useAuth();
  const {
    subscriptions,
    categories,
    isLoading,
    deleteSubscription,
    getTotalMonthlyCost,
  } = useSubscriptions();

  const { limitInfo } = useSubscriptionLimits();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState("all");

  const displayCurrency = profile?.default_currency || DEFAULTS.currency;

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Uncategorized";
  };

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const categoryName = getCategoryName(subscription.category_id);
    const matchesSearch =
      subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && subscription.is_active) ||
      (filterActive === "inactive" && !subscription.is_active);

    return matchesSearch && matchesActive;
  });

  const handleDeleteSubscription = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteSubscription(id);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading subscriptions...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Subscriptions</h1>
          <p className="text-muted-foreground text-sm">Review, edit and add your subscriptions here.</p>
        </div>
        <div className="flex items-center gap-3">
          <AutoFetchButton className="add-btn" />
          <AddSubscriptionModal
            trigger={
              <button className="add-btn">
                <Plus className="h-4 w-4" />
                Add Subscription
              </button>
            }
          />
        </div>
      </div>

      <div className="kpi-grid mb-6">
        <div className="kpi">
          <div className="kpi-accent" style={{ background: "var(--c-green)" }}></div>
          <div className="kpi-lbl">Total Monthly</div>
          <div className="kpi-val">{formatCurrencyAmount(getTotalMonthlyCost(), displayCurrency)}</div>
          <DollarSign className="kpi-glyph" />
        </div>
        <div className="kpi">
          <div className="kpi-accent" style={{ background: "var(--c-blue)" }}></div>
          <div className="kpi-lbl">Total Subs</div>
          <div className="kpi-val">{limitInfo.current}</div>
          <div className="kpi-delta">Of {limitInfo.limit === "unlimited" ? "∞" : limitInfo.limit} allowed</div>
          <CreditCard className="kpi-glyph" />
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search className="sico h-4 w-4" />
          <input
            type="text"
            className="search-inp"
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className={`ftab ${filterActive === "all" ? "on" : ""}`}
          onClick={() => setFilterActive("all")}
        >
          All ({subscriptions.length})
        </button>
        <button
          className={`ftab ${filterActive === "active" ? "on" : ""}`}
          onClick={() => setFilterActive("active")}
        >
          Active
        </button>
        <button
          className={`ftab ${filterActive === "inactive" ? "on" : ""}`}
          onClick={() => setFilterActive("inactive")}
        >
          Inactive
        </button>
      </div>

      <div className="table">
        <div className="thead hidden md:grid">
          <div className="th">Service</div>
          <div className="th">Cost</div>
          <div className="th">Status</div>
          <div className="th">Next Bill</div>
          <div className="th">Tags</div>
          <div className="th text-right">Actions</div>
        </div>

        {filteredSubscriptions.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No subscriptions found matching your filters.
          </div>
        ) : (
          filteredSubscriptions.map((sub) => {
            const renewal = getDaysUntilRenewal(sub.renewal_date);
            return (
              <div className="trow flex flex-col md:grid" key={sub.id}>
                <div className="tc-main">
                  <div className="tc-ico" style={{ background: "rgba(255,255,255,0.05)" }}>
                    {sub.name.charAt(0)}
                  </div>
                  <div>
                    <div className="tc-name">{sub.name}</div>
                    <div className="tc-sub">{getCategoryName(sub.category_id)}</div>
                  </div>
                </div>
                <div className="tc-mono hidden md:block">
                  {formatCurrencyAmount(sub.cost, sub.currency)} <span className="tc-sub">/{sub.billing_cycle === "monthly" ? "mo" : "yr"}</span>
                </div>
                <div className="hidden md:block">
                  <span className={`badge ${sub.is_active ? 'badge-g' : 'badge-n'}`}>
                    {sub.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="tc">{renewal}</div>
                  <div className="tc-sub">{new Date(sub.renewal_date).toLocaleDateString()}</div>
                </div>
                <div className="hidden md:flex gap-1 flex-wrap">
                  {sub.tags && sub.tags.map(t => (
                    <span key={t} className="badge badge-n"><Tag className="w-2.5 h-2.5 mr-1" /> {t}</span>
                  ))}
                </div>
                <div className="act-group justify-end w-full md:w-auto mt-4 md:mt-0">
                  <div className="md:hidden tc-mono mr-auto">
                    {formatCurrencyAmount(sub.cost, sub.currency)}
                  </div>
                  <button className="act" title="Edit">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button className="act hover:!text-red-500 hover:!border-red-500/30" title="Delete" onClick={() => handleDeleteSubscription(sub.id, sub.name)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
