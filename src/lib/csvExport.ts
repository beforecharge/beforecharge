import { format } from "date-fns";
import { Subscription } from "@/types/app.types";

export interface ExportOptions {
  includeInactive?: boolean;
  dateFormat?: string;
  includeCategories?: boolean;
  includeTags?: boolean;
  includeNotes?: boolean;
  customFields?: string[];
}

export interface ExportData extends Subscription {
  category_name?: string;
  monthly_cost?: number;
  annual_cost?: number;
  days_until_renewal?: number;
  status?: string;
}

/**
 * Converts subscription data to CSV format
 */
export class SubscriptionCSVExporter {
  private static readonly DEFAULT_DATE_FORMAT = "yyyy-MM-dd";

  /**
   * Export subscriptions to CSV format
   */
  static exportToCSV(
    subscriptions: Subscription[],
    categories: Array<{ id: string; name: string }> = [],
    options: ExportOptions = {},
  ): string {
    const {
      includeInactive = true,
      dateFormat = this.DEFAULT_DATE_FORMAT,
      includeCategories = true,
      includeTags = true,
      includeNotes = true,
      customFields = [],
    } = options;

    // Filter subscriptions based on options
    const filteredSubscriptions = includeInactive
      ? subscriptions
      : subscriptions.filter((sub) => sub.is_active);

    if (filteredSubscriptions.length === 0) {
      throw new Error("No subscriptions to export");
    }

    // Prepare data with additional calculated fields
    const exportData = this.prepareExportData(
      filteredSubscriptions,
      categories,
      dateFormat,
    );

    // Generate CSV headers
    const headers = this.generateHeaders({
      includeCategories,
      includeTags,
      includeNotes,
      customFields,
      ...options,
    });

    // Generate CSV rows
    const rows = exportData.map((subscription) =>
      this.generateRow(subscription, headers, {
        includeCategories,
        includeTags,
        includeNotes,
        customFields,
        ...options,
      }),
    );

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    return csvContent;
  }

  /**
   * Download CSV file to user's device
   */
  static downloadCSV(
    subscriptions: Subscription[],
    categories: Array<{ id: string; name: string }> = [],
    options: ExportOptions = {},
    filename?: string,
  ): void {
    try {
      const csvContent = this.exportToCSV(subscriptions, categories, options);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      // Create download link
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", filename || this.generateFilename());
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      throw new Error("Failed to download CSV file");
    }
  }

  /**
   * Prepare subscription data with calculated fields
   */
  private static prepareExportData(
    subscriptions: Subscription[],
    categories: Array<{ id: string; name: string }>,
    dateFormat: string,
  ): ExportData[] {
    return subscriptions.map((subscription) => {
      // Find category name
      const category = categories.find(
        (cat) => cat.id === subscription.category_id,
      );

      // Calculate monthly cost
      const monthlyCost = this.calculateMonthlyCost(
        subscription.cost,
        subscription.billing_cycle,
      );

      // Calculate annual cost
      const annualCost = monthlyCost * 12;

      // Calculate days until renewal
      const daysUntilRenewal = this.calculateDaysUntilRenewal(
        subscription.renewal_date,
      );

      // Format dates
      const renewalDate = subscription.renewal_date
        ? format(new Date(subscription.renewal_date), dateFormat)
        : "";

      const trialEndDate = subscription.trial_end_date
        ? format(new Date(subscription.trial_end_date), dateFormat)
        : "";

      const createdAt = format(new Date(subscription.created_at), dateFormat);
      const updatedAt = format(new Date(subscription.updated_at), dateFormat);

      return {
        ...subscription,
        category_name: category?.name || "Uncategorized",
        monthly_cost: Number(monthlyCost.toFixed(2)),
        annual_cost: Number(annualCost.toFixed(2)),
        days_until_renewal: daysUntilRenewal,
        status: subscription.is_active ? "Active" : "Inactive",
        renewal_date: renewalDate,
        trial_end_date: trialEndDate,
        created_at: createdAt,
        updated_at: updatedAt,
      };
    });
  }

  /**
   * Generate CSV headers based on options
   */
  private static generateHeaders(options: ExportOptions): string[] {
    const baseHeaders = [
      "Name",
      "Description",
      "Cost",
      "Currency",
      "Billing Cycle",
      "Monthly Cost",
      "Annual Cost",
      "Renewal Date",
      "Days Until Renewal",
      "Status",
      "Website URL",
      "Last Used Date",
      "Trial End Date",
      "Created Date",
      "Updated Date",
    ];

    const conditionalHeaders: string[] = [];

    if (options.includeCategories) {
      conditionalHeaders.push("Category");
    }

    if (options.includeTags) {
      conditionalHeaders.push("Tags");
    }

    if (options.includeNotes) {
      conditionalHeaders.push("Notes");
    }

    return [
      ...baseHeaders,
      ...conditionalHeaders,
      ...(options.customFields || []),
    ];
  }

  /**
   * Generate CSV row for a subscription
   */
  private static generateRow(
    subscription: ExportData,
    _headers: string[],
    options: ExportOptions,
  ): string[] {
    const row: string[] = [
      this.escapeCsvValue(subscription.name),
      this.escapeCsvValue(subscription.description || ""),
      subscription.cost.toString(),
      subscription.currency,
      this.formatBillingCycle(subscription.billing_cycle),
      subscription.monthly_cost?.toString() || "0",
      subscription.annual_cost?.toString() || "0",
      subscription.renewal_date,
      subscription.days_until_renewal?.toString() || "0",
      subscription.status || "",
      this.escapeCsvValue(subscription.website_url || ""),
      subscription.last_used_date || "",
      subscription.trial_end_date || "",
      subscription.created_at,
      subscription.updated_at,
    ];

    // Add conditional fields
    if (options.includeCategories) {
      row.push(this.escapeCsvValue(subscription.category_name || ""));
    }

    if (options.includeTags) {
      row.push(this.escapeCsvValue(subscription.tags?.join("; ") || ""));
    }

    if (options.includeNotes) {
      row.push(this.escapeCsvValue(subscription.notes || ""));
    }

    // Add custom fields (empty for now, can be extended)
    if (options.customFields) {
      options.customFields.forEach(() => row.push(""));
    }

    return row;
  }

  /**
   * Calculate monthly cost from any billing cycle
   */
  private static calculateMonthlyCost(
    cost: number,
    billingCycle: string,
  ): number {
    const multipliers: Record<string, number> = {
      daily: 30.44, // Average days per month
      weekly: 4.33, // Average weeks per month
      monthly: 1,
      quarterly: 1 / 3,
      "semi-annual": 1 / 6,
      annual: 1 / 12,
    };

    const multiplier = multipliers[billingCycle] || 1;
    return cost * multiplier;
  }

  /**
   * Calculate days until renewal
   */
  private static calculateDaysUntilRenewal(renewalDate: string): number {
    const renewal = new Date(renewalDate);
    const now = new Date();
    const diffTime = renewal.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Format billing cycle for display
   */
  private static formatBillingCycle(cycle: string): string {
    const cycleMap: Record<string, string> = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      quarterly: "Quarterly",
      "semi-annual": "Semi-Annual",
      annual: "Annual",
    };

    return cycleMap[cycle] || cycle.charAt(0).toUpperCase() + cycle.slice(1);
  }

  /**
   * Escape CSV values to handle commas, quotes, and newlines
   */
  private static escapeCsvValue(value: string): string {
    if (!value) return "";

    // Convert to string and remove any existing quotes
    const stringValue = String(value).replace(/"/g, '""');

    // If value contains comma, quote, or newline, wrap in quotes
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n") ||
      stringValue.includes("\r")
    ) {
      return `"${stringValue}"`;
    }

    return stringValue;
  }

  /**
   * Generate filename with timestamp
   */
  private static generateFilename(): string {
    const now = new Date();
    const timestamp = format(now, "yyyy-MM-dd_HH-mm-ss");
    return `subscriptions_export_${timestamp}.csv`;
  }

  /**
   * Get export statistics
   */
  static getExportStats(subscriptions: Subscription[]): {
    total: number;
    active: number;
    inactive: number;
    totalMonthlyCost: number;
    totalAnnualCost: number;
    currencies: string[];
    categories: string[];
  } {
    const active = subscriptions.filter((sub) => sub.is_active);
    const inactive = subscriptions.filter((sub) => !sub.is_active);

    const totalMonthlyCost = active.reduce((sum, sub) => {
      return sum + this.calculateMonthlyCost(sub.cost, sub.billing_cycle);
    }, 0);

    const currencies = [...new Set(subscriptions.map((sub) => sub.currency))];
    const categories = [
      ...new Set(subscriptions.map((sub) => sub.category_id)),
    ];

    return {
      total: subscriptions.length,
      active: active.length,
      inactive: inactive.length,
      totalMonthlyCost: Number(totalMonthlyCost.toFixed(2)),
      totalAnnualCost: Number((totalMonthlyCost * 12).toFixed(2)),
      currencies,
      categories,
    };
  }

  /**
   * Validate export data before processing
   */
  static validateExportData(subscriptions: Subscription[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!subscriptions || subscriptions.length === 0) {
      errors.push("No subscriptions provided for export");
    }

    subscriptions.forEach((sub, index) => {
      if (!sub.name || sub.name.trim() === "") {
        errors.push(`Subscription at index ${index} has no name`);
      }

      if (typeof sub.cost !== "number" || sub.cost < 0) {
        errors.push(`Subscription "${sub.name}" has invalid cost: ${sub.cost}`);
      }

      if (!sub.currency) {
        warnings.push(`Subscription "${sub.name}" has no currency specified`);
      }

      if (!sub.renewal_date) {
        warnings.push(`Subscription "${sub.name}" has no renewal date`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Quick export functions for common use cases
 */
export const exportSubscriptionsCSV = (
  subscriptions: Subscription[],
  categories: Array<{ id: string; name: string }> = [],
  filename?: string,
) => {
  SubscriptionCSVExporter.downloadCSV(
    subscriptions,
    categories,
    {
      includeInactive: true,
      includeCategories: true,
      includeTags: true,
      includeNotes: true,
    },
    filename,
  );
};

export const exportActiveSubscriptionsCSV = (
  subscriptions: Subscription[],
  categories: Array<{ id: string; name: string }> = [],
  filename?: string,
) => {
  SubscriptionCSVExporter.downloadCSV(
    subscriptions,
    categories,
    {
      includeInactive: false,
      includeCategories: true,
      includeTags: true,
      includeNotes: true,
    },
    filename,
  );
};

export const exportMinimalCSV = (
  subscriptions: Subscription[],
  categories: Array<{ id: string; name: string }> = [],
  filename?: string,
) => {
  SubscriptionCSVExporter.downloadCSV(
    subscriptions,
    categories,
    {
      includeInactive: true,
      includeCategories: true,
      includeTags: false,
      includeNotes: false,
    },
    filename,
  );
};

export default SubscriptionCSVExporter;
