import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  X,
  Calendar as CalendarIcon,
  AlertTriangle,
  Star,
  Crown,
} from "lucide-react";
import { format } from "date-fns";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

import { BillingCycle, Currency } from "@/types/app.types";
import { CURRENCY_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface AddSubscriptionModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SubscriptionFormData {
  name: string;
  description: string;
  cost: string;
  currency: Currency;
  billing_cycle: BillingCycle;
  renewal_date: Date;
  category_id: string;
  tags: string[];
  website_url: string;
  notes: string;
  trial_end_date?: Date;
}

const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi-annual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
];

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  const { categories, addSubscription } = useSubscriptions();

  const {
    limitInfo,
    upgradeInfo,
    checkCanAddSubscription,
    handleUpgradePrompt,
  } = useSubscriptionLimits();

  // State management
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTrialCalendar, setShowTrialCalendar] = useState(false);

  // Form state
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: "",
    description: "",
    cost: "",
    currency: CURRENCY_CONFIG.default,
    billing_cycle: "monthly",
    renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    category_id: "",
    tags: [],
    website_url: "",
    notes: "",
  });

  // Handle controlled/uncontrolled state
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const setIsOpen = controlledOnOpenChange || setOpen;

  // Check subscription limits
  const checkSubscriptionLimits = (): boolean => {
    const canAdd = checkCanAddSubscription();

    if (!canAdd) {
      setShowUpgradePrompt(true);
      handleUpgradePrompt();
      return false;
    }

    return true;
  };

  // Handle form input changes
  const handleInputChange = (field: keyof SubscriptionFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle tag addition
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Subscription name is required");
      return false;
    }

    if (!formData.cost || parseFloat(formData.cost) < 0) {
      toast.error("Valid cost is required");
      return false;
    }

    if (!formData.category_id) {
      toast.error("Please select a category");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!checkSubscriptionLimits()) return;

    setIsLoading(true);

    try {
      await addSubscription({
        name: formData.name,
        description: formData.description,
        cost: formData.cost,
        currency: formData.currency,
        billing_cycle: formData.billing_cycle,
        renewal_date: formData.renewal_date.toISOString().split("T")[0],
        category_id: formData.category_id,
        tags: formData.tags,
        website_url: formData.website_url,
        notes: formData.notes,
        trial_end_date: formData.trial_end_date?.toISOString().split("T")[0],
      });

      toast.success("Subscription added successfully!");
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding subscription:", error);
      toast.error("Failed to add subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      cost: "",
      currency: CURRENCY_CONFIG.default,
      billing_cycle: "monthly",
      renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      category_id: "",
      tags: [],
      website_url: "",
      notes: "",
    });
    setNewTag("");
    setShowUpgradePrompt(false);
  };

  // Handle modal open change
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  // Upgrade prompt component
  const UpgradePrompt = () => {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <AlertTriangle className="h-5 w-5" />
            {upgradeInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            {upgradeInfo.message} Upgrade to{" "}
            <span className="font-medium capitalize">
              {upgradeInfo.suggestedPlan}
            </span>{" "}
            to add more subscriptions!
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Current subscriptions:</span>
              <span className="font-medium">
                {limitInfo.current}/
                {limitInfo.limit === "unlimited" ? "∞" : limitInfo.limit}
              </span>
            </div>
            {limitInfo.limit !== "unlimited" && (
              <div className="w-full bg-orange-200 rounded-full h-2 dark:bg-orange-800">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(limitInfo.percentage, 100)}%` }}
                />
              </div>
            )}
          </div>

          {upgradeInfo.benefits.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-orange-800 dark:text-orange-200">
                {upgradeInfo.suggestedPlan} plan benefits:
              </p>
              <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                {upgradeInfo.benefits.slice(0, 3).map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-1 w-1 bg-orange-500 rounded-full" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => (window.location.href = "/pricing")}
              className="flex items-center gap-2"
            >
              {upgradeInfo.currentPlan === "free" ? (
                <Star className="h-4 w-4" />
              ) : (
                <Crown className="h-4 w-4" />
              )}
              Upgrade Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpgradePrompt(false)}
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Subscription
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new subscription to your account.
          </DialogDescription>
        </DialogHeader>

        {showUpgradePrompt ? (
          <UpgradePrompt />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Service Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Netflix, Spotify, etc."
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      handleInputChange("category_id", value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Brief description of the service"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Pricing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">
                    Cost <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => handleInputChange("cost", e.target.value)}
                    placeholder="0.00"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value: Currency) =>
                      handleInputChange("currency", value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_CONFIG.supported.map((curr) => (
                        <SelectItem key={curr} value={curr}>
                          {curr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing_cycle">Billing Cycle</Label>
                  <Select
                    value={formData.billing_cycle}
                    onValueChange={(value: BillingCycle) =>
                      handleInputChange("billing_cycle", value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BILLING_CYCLES.map((cycle) => (
                        <SelectItem key={cycle.value} value={cycle.value}>
                          {cycle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Next Renewal Date</Label>
                  <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.renewal_date && "text-muted-foreground",
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.renewal_date ? (
                          format(formData.renewal_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.renewal_date}
                        onSelect={(date) => {
                          if (date) handleInputChange("renewal_date", date);
                          setShowCalendar(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Trial End Date (Optional)</Label>
                  <Popover
                    open={showTrialCalendar}
                    onOpenChange={setShowTrialCalendar}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.trial_end_date && "text-muted-foreground",
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.trial_end_date ? (
                          format(formData.trial_end_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.trial_end_date}
                        onSelect={(date) => {
                          handleInputChange("trial_end_date", date);
                          setShowTrialCalendar(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={isLoading}
                  >
                    Add
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) =>
                    handleInputChange("website_url", e.target.value)
                  }
                  placeholder="https://example.com"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any additional notes about this subscription"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subscription
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddSubscriptionModal;
