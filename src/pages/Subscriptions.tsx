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
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import useSubscriptions from "@/hooks/useSubscriptions";
import { DEFAULTS } from "@/lib/constants";
import { formatCurrencyAmount, convertCurrency } from "@/utils/currencyUtils";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent, ANALYTICS_EVENTS } from "@/utils/analytics";

const getDaysUntilRenewal = (renewalDate: string) => {
  const renewal = new Date(renewalDate);
  const now = new Date();
  const diffTime = renewal.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Renewed";
  if (diffDays === 0) return "Renews today";
  if (diffDays === 1) return "Renews tomorrow";
  return `Renews in ${diffDays} days`;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      trackEvent(ANALYTICS_EVENTS.SUB_DELETED, { sub_name: name });
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
          <div className="relative flex justify-center">
            <AutoFetchButton className="add-btn" />
            {profile?.plan_type === "free" && (
              <span className="absolute -bottom-5 text-[9px] text-muted-foreground/70 uppercase tracking-wider font-medium whitespace-nowrap">Free Plan: 1 Fetch Limit</span>
            )}
          </div>
          <AddSubscriptionModal
            trigger={
              <button className="add-btn" onClick={() => trackEvent(ANALYTICS_EVENTS.ADD_SUBSCRIPTION_CLICK)}>
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

      <style>{`
        .act {
          color: var(--c-txt2);
          border-color: var(--c-border2);
        }
        .act:hover {
          color: var(--c-txt);
          border-color: var(--c-border3);
          background: rgba(255,255,255,0.05);
        }
        .trow.expanded {
          background: rgba(18,232,136,0.03);
          border-color: var(--c-green-rim);
        }
      `}</style>

      <div className="table">
        <div className="thead hidden md:grid md:grid-cols-[2fr_1.5fr_1fr_1.5fr_1.5fr_minmax(100px,auto)] px-4">
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
              <React.Fragment key={sub.id}>
                <div
                  className={`trow flex flex-col md:grid md:grid-cols-[2fr_1.5fr_1fr_1.5fr_1.5fr_minmax(100px,auto)] px-4 py-4 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors gap-4 md:gap-0 ${expandedId === sub.id ? "expanded" : ""}`}
                  onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                >
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
                    {sub.currency !== displayCurrency ? (
                      <>
                        {formatCurrencyAmount(convertCurrency(sub.cost, sub.currency, displayCurrency), displayCurrency)}
                        <span className="text-[10px] text-muted-foreground ml-1">
                          ({formatCurrencyAmount(sub.cost, sub.currency)})
                        </span>
                      </>
                    ) : (
                      formatCurrencyAmount(sub.cost, sub.currency)
                    )}
                    <span className="tc-sub ml-1">/{sub.billing_cycle === "monthly" ? "mo" : "yr"}</span>
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
                  <div className="act-group justify-end w-full md:w-auto mt-4 md:mt-0" onClick={e => e.stopPropagation()}>
                    <div className="md:hidden tc-mono mr-auto">
                      {sub.currency !== displayCurrency ? (
                        <>
                          {formatCurrencyAmount(convertCurrency(sub.cost, sub.currency, displayCurrency), displayCurrency)}
                          <span className="text-[10px] text-muted-foreground ml-1">
                            ({formatCurrencyAmount(sub.cost, sub.currency)})
                          </span>
                        </>
                      ) : (
                        formatCurrencyAmount(sub.cost, sub.currency)
                      )}
                    </div>
                    <button className="act" title="Edit" onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toast.error("Editing coming soon in this view");
                    }}>
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button className="act hover:!text-red-500 hover:!border-red-500/30" title="Delete" onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteSubscription(sub.id, sub.name);
                    }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {expandedId === sub.id && (
                  <div className="p-6 bg-black/20 border-x border-b border-white/5 rounded-b-lg -mt-1 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Details</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-foreground">{sub.description || "No description provided."}</p>
                          {sub.website_url && (
                            <a href={sub.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block">
                              Visit Website →
                            </a>
                          )}
                        </div>
                        {sub.notes && (
                          <div className="pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Notes</h4>
                            <p className="text-sm text-muted-foreground italic">"{sub.notes}"</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Info</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">Next Billing</p>
                            <p className="text-sm font-medium">{new Date(sub.renewal_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">Interval</p>
                            <p className="text-sm font-medium capitalize">{sub.billing_cycle}</p>
                          </div>
                        </div>
                        <div className="pt-2">
                          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => toast.error("Editing coming soon in this view")}>
                            Edit Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
