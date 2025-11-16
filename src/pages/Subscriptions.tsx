import React, { useState } from "react";

import {
  Plus,
  Search,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  ExternalLink,
  Tag,
  Zap,
  Download,
} from "lucide-react";

import {
  AddSubscriptionModal,
  AutoFetchSubscriptions,
} from "@/components/subscriptions";
import GmailAutoFetch from "@/components/subscriptions/GmailAutoFetch";
import AutoFetchButton from "@/components/subscriptions/AutoFetchButton";
import { exportSubscriptionsCSV } from "@/lib/csvExport";
import { formatCurrencyAmount } from "@/utils/currencyUtils";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import useSubscriptions from "@/hooks/useSubscriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Streaming: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    Music:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    Software:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    Fitness:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    Finance:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    Education:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    Business:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    Utilities:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    "Food & Drink":
      "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
    Transportation:
      "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400",
    Shopping:
      "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400",
    Communication:
      "bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-400",
    Storage:
      "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400",
    Gaming: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400",
    News: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
  };
  return (
    colors[category] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  );
};

const formatCurrency = (amount: number, currency: string = "USD") => {
  return formatCurrencyAmount(amount, currency);
};

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
  const {
    subscriptions,
    categories,
    isLoading,
    deleteSubscription,
    getTotalMonthlyCost,
    getActiveSubscriptions,
  } = useSubscriptions();

  const { userPlan } = useSubscriptionLimits();

  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [filterActive, setFilterActive] = useState("all"); // all, active, inactive
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showGmailAutoFetch, setShowGmailAutoFetch] = useState(false);

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  // Filter subscriptions based on search and filters
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const categoryName = getCategoryName(subscription.category_id);
    const matchesSearch =
      subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && subscription.is_active) ||
      (filterActive === "inactive" && !subscription.is_active);

    const matchesCategory =
      selectedCategory === "all" || categoryName === selectedCategory;

    return matchesSearch && matchesActive && matchesCategory;
  });

  // Get unique category names from subscriptions
  const uniqueCategories = Array.from(
    new Set(subscriptions.map((sub) => getCategoryName(sub.category_id))),
  );

  // Calculate totals
  const activeSubscriptions = getActiveSubscriptions();
  const totalMonthlySpend = getTotalMonthlyCost();

  const handleEditSubscription = (id: string) => {
    // Navigate to edit subscription
    alert(
      `Edit subscription feature coming soon! Would edit subscription ${id}`,
    );
  };

  const handleDeleteSubscription = async (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      )
    ) {
      await deleteSubscription(id);
    }
  };

  const handleOpenWebsite = (url: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await exportSubscriptionsCSV(filteredSubscriptions, categories);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" showText text="Loading subscriptions..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage and track all your subscription services
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <AutoFetchButton 
              variant="outline" 
              size="sm" 
              className="flex-1 sm:flex-none"
              onComplete={() => {
                // Refresh subscriptions list
                window.location.reload();
              }}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 sm:flex-none"
              onClick={() => setShowGmailAutoFetch(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Manual Review</span>
              <span className="sm:hidden">Review</span>
            </Button>
            <AutoFetchSubscriptions
              trigger={
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Zap className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Other Sources</span>
                  <span className="sm:hidden">Other</span>
                </Button>
              }
            />
            {userPlan && userPlan.type !== "free" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={isExporting || filteredSubscriptions.length === 0}
                className="flex-1 sm:flex-none"
              >
                {isExporting ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
            )}
          </div>
          <AddSubscriptionModal
            trigger={
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="sm:hidden">Add</span>
                <span className="hidden sm:inline">Add Subscription</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-mobile grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="mobile-card-compact">
          <CardContent className="mobile-card-content pt-4 sm:pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {activeSubscriptions.length}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Active Subscriptions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mobile-card-compact">
          <CardContent className="mobile-card-content pt-4 sm:pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {formatCurrency(totalMonthlySpend)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Monthly Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mobile-card-compact">
          <CardContent className="mobile-card-content pt-4 sm:pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {formatCurrency(totalMonthlySpend * 12)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Annual Projection
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mobile-card-compact">
        <CardContent className="mobile-card-content pt-4 sm:pt-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 mobile-input"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Status Filter */}
              <div className="flex gap-2 flex-1">
                <Button
                  variant={filterActive === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive("all")}
                  className="flex-1 sm:flex-none"
                >
                  All
                </Button>
                <Button
                  variant={filterActive === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive("active")}
                  className="flex-1 sm:flex-none"
                >
                  Active
                </Button>
                <Button
                  variant={filterActive === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive("inactive")}
                  className="flex-1 sm:flex-none"
                >
                  Inactive
                </Button>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm w-full sm:w-auto"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Grid */}
      {filteredSubscriptions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                No subscriptions found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ||
                filterActive !== "all" ||
                selectedCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first subscription"}
              </p>
              {!searchQuery &&
                filterActive === "all" &&
                selectedCategory === "all" && (
                  <AddSubscriptionModal
                    trigger={
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Subscription
                      </Button>
                    }
                  />
                )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubscriptions.map((subscription) => {
            const categoryName = getCategoryName(subscription.category_id);
            const daysUntilRenewal = getDaysUntilRenewal(
              subscription.renewal_date,
            );
            const isOverdue = daysUntilRenewal === "Overdue";
            const isRenewingSoon =
              (typeof daysUntilRenewal === "string" &&
                (daysUntilRenewal === "Today" ||
                  daysUntilRenewal === "Tomorrow")) ||
              (typeof daysUntilRenewal === "string" &&
                daysUntilRenewal.includes("days") &&
                parseInt(daysUntilRenewal) <= 7);

            return (
              <Card
                key={subscription.id}
                className={`subscription-card mobile-card-compact ${!subscription.is_active ? "opacity-60" : ""}`}
              >
                <CardHeader className="mobile-card-header pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-primary">
                          {subscription.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm sm:text-base truncate">
                          {subscription.name}
                        </CardTitle>
                        {subscription.description && (
                          <CardDescription className="text-xs truncate">
                            {subscription.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status and Category */}
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(categoryName)}`}
                    >
                      {categoryName}
                    </span>
                    {!subscription.is_active && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                        Inactive
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="mobile-card-content space-y-3 sm:space-y-4">
                  {/* Cost */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cost</span>
                    <span className="font-medium">
                      {formatCurrency(subscription.cost, subscription.currency)}
                      /
                      {subscription.billing_cycle === "monthly"
                        ? "mo"
                        : subscription.billing_cycle === "annual"
                          ? "yr"
                          : subscription.billing_cycle}
                    </span>
                  </div>

                  {/* Next Renewal */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Next Renewal
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isOverdue
                          ? "text-destructive"
                          : isRenewingSoon
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-foreground"
                      }`}
                    >
                      {daysUntilRenewal}
                    </span>
                  </div>

                  {/* Tags */}
                  {subscription.tags && subscription.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {subscription.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground"
                        >
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs sm:text-sm"
                      onClick={() => handleEditSubscription(subscription.id)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    {subscription.website_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleOpenWebsite(subscription.website_url!)
                        }
                        className="px-2 sm:px-3"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDeleteSubscription(
                          subscription.id,
                          subscription.name,
                        )
                      }
                      className="text-destructive hover:text-destructive px-2 sm:px-3"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Gmail Auto-Fetch Modal */}
      {showGmailAutoFetch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Gmail Auto-Fetch</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowGmailAutoFetch(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <GmailAutoFetch 
                onSubscriptionsAdded={(_count) => {
                  setShowGmailAutoFetch(false);
                  // Optionally refresh the subscriptions list here
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
