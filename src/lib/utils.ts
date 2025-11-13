import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
  addDays,
  parseISO,
} from "date-fns";
import {
  Currency,
  BillingCycle,
  CURRENCY_SYMBOLS,
  BILLING_CYCLE_MULTIPLIERS,
  Subscription,
} from "@/types/app.types";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Currency formatting utilities
 */
export function formatCurrency(
  amount: number,
  currency: Currency = "USD",
): string {
  const symbol = CURRENCY_SYMBOLS[currency];

  // For currencies that use symbols after the amount
  if (currency === "SEK" || currency === "NOK" || currency === "DKK") {
    return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
  }

  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function parseCurrencyInput(value: string): number {
  // Remove currency symbols and spaces, keep only numbers and decimal point
  const cleaned = value.replace(/[^\d.,]/g, "");
  // Handle comma as decimal separator
  const normalized = cleaned.replace(",", ".");
  return parseFloat(normalized) || 0;
}

/**
 * Date formatting utilities
 */
export function formatDate(
  date: string | Date,
  formatStr: string = "MMM dd, yyyy",
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (isToday(dateObj)) return "Today";
  if (isTomorrow(dateObj)) return "Tomorrow";
  if (isYesterday(dateObj)) return "Yesterday";

  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function getDaysUntilRenewal(renewalDate: string): number {
  const renewal = parseISO(renewalDate);
  const now = new Date();
  const diffTime = renewal.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getNextRenewalDate(
  lastRenewal: string,
  billingCycle: BillingCycle,
): string {
  const lastDate = parseISO(lastRenewal);

  switch (billingCycle) {
    case "daily":
      return addDays(lastDate, 1).toISOString();
    case "weekly":
      return addDays(lastDate, 7).toISOString();
    case "monthly":
      return addDays(lastDate, 30).toISOString(); // Approximate
    case "quarterly":
      return addDays(lastDate, 90).toISOString(); // Approximate
    case "semi-annual":
      return addDays(lastDate, 182).toISOString(); // Approximate
    case "annual":
      return addDays(lastDate, 365).toISOString();
    default:
      return addDays(lastDate, 30).toISOString();
  }
}

/**
 * Billing cycle utilities
 */
export function convertToAnnualCost(
  cost: number,
  billingCycle: BillingCycle,
): number {
  const multiplier = BILLING_CYCLE_MULTIPLIERS[billingCycle];
  return cost * multiplier;
}

export function convertToMonthlyCost(
  cost: number,
  billingCycle: BillingCycle,
): number {
  const annualCost = convertToAnnualCost(cost, billingCycle);
  return annualCost / 12;
}

export function calculateSavings(
  monthlyCost: number,
  annualCost: number,
): { amount: number; percentage: number } {
  const actualAnnual = monthlyCost * 12;
  const savings = actualAnnual - annualCost;
  const percentage = (savings / actualAnnual) * 100;

  return { amount: savings, percentage };
}

/**
 * Color utilities
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function generateRandomColor(): string {
  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#c084fc",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * File utilities
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
}

/**
 * Validation utilities
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Array and object utilities
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
}

export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc",
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((sum, item) => {
    const value = item[key];
    return sum + (typeof value === "number" ? value : 0);
  }, 0);
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Analytics utilities
 */
export function calculatePercentageChange(
  current: number,
  previous: number,
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function calculateGrowthRate(values: number[]): number {
  if (values.length < 2) return 0;

  const first = values[0];
  const last = values[values.length - 1];

  if (first === 0) return last > 0 ? 100 : 0;
  return ((last - first) / first) * 100;
}

export function movingAverage(values: number[], windowSize: number): number[] {
  if (windowSize >= values.length)
    return [values.reduce((a, b) => a + b, 0) / values.length];

  const result: number[] = [];
  for (let i = 0; i <= values.length - windowSize; i++) {
    const window = values.slice(i, i + windowSize);
    const average = window.reduce((a, b) => a + b, 0) / windowSize;
    result.push(average);
  }

  return result;
}

/**
 * Chart data utilities
 */
export function prepareChartData<T>(
  data: T[],
  valueKey: keyof T,
  labelKey: keyof T,
  colors?: string[],
): Array<{ name: string; value: number; color?: string }> {
  return data.map((item, index) => ({
    name: String(item[labelKey]),
    value: Number(item[valueKey]) || 0,
    color: colors?.[index % colors.length],
  }));
}

export function calculatePercentages(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total === 0) return values.map(() => 0);

  return values.map((value) => (value / total) * 100);
}

/**
 * Search and filter utilities
 */
export function fuzzySearch(
  items: any[],
  query: string,
  keys: string[],
): any[] {
  if (!query.trim()) return items;

  const searchTerm = query.toLowerCase().trim();

  return items.filter((item) => {
    return keys.some((key) => {
      const value = getNestedValue(item, key);
      if (typeof value === "string") {
        return value.toLowerCase().includes(searchTerm);
      }
      if (Array.isArray(value)) {
        return value.some((v) => String(v).toLowerCase().includes(searchTerm));
      }
      return String(value).toLowerCase().includes(searchTerm);
    });
  });
}

export function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

/**
 * Local storage utilities
 */
export function saveToLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn("Failed to load from localStorage:", error);
    return defaultValue;
  }
}

export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to remove from localStorage:", error);
  }
}

/**
 * Export utilities
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = "text/plain",
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(",");

  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(","),
  );

  return [csvHeaders, ...csvRows].join("\n");
}

/**
 * Debounce utility
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle utility
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Subscription-specific utilities
 */
export function getSubscriptionStatus(
  subscription: Subscription,
): "active" | "trial" | "cancelled" | "expired" {
  if (!subscription.is_active) return "cancelled";

  if (subscription.trial_end_date) {
    const trialEnd = parseISO(subscription.trial_end_date);
    if (new Date() < trialEnd) return "trial";
  }

  const renewalDate = parseISO(subscription.renewal_date);
  if (new Date() > renewalDate) return "expired";

  return "active";
}

export function getUpcomingRenewals(
  subscriptions: Subscription[],
  days: number = 30,
): Subscription[] {
  const now = new Date();
  const futureDate = addDays(now, days);

  return subscriptions.filter((sub) => {
    if (!sub.is_active) return false;
    const renewalDate = parseISO(sub.renewal_date);
    return renewalDate >= now && renewalDate <= futureDate;
  });
}

export function calculateTotalMonthlyCost(
  subscriptions: Subscription[],
): number {
  return subscriptions
    .filter((sub) => sub.is_active)
    .reduce((total, sub) => {
      const monthlyCost = convertToMonthlyCost(
        sub.cost,
        sub.billing_cycle as BillingCycle,
      );
      return total + monthlyCost;
    }, 0);
}
