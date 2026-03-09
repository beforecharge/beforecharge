import { Currency } from "@/types/app.types";

export function guessUserCurrency(): Currency {
  try {
    // 1. Try timezone first
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Europe/London") || tz.includes("Europe/Belfast")) return "GBP";
    if (tz.includes("Europe/Zurich")) return "CHF";
    if (tz.includes("Europe/Stockholm")) return "SEK";
    if (tz.includes("Europe/Oslo")) return "NOK";
    if (tz.includes("Europe/Copenhagen")) return "DKK";
    if (tz.includes("Europe/Paris") || tz.includes("Europe/Berlin") || tz.includes("Europe/Rome") || tz.includes("Europe/Madrid") || tz.includes("Europe/Amsterdam")) return "EUR";
    if (tz.includes("Asia/Kolkata") || tz.includes("Asia/Calcutta")) return "INR";
    if (tz.includes("Australia/")) return "AUD";
    if (tz.includes("Canada/") || tz.includes("America/Toronto") || tz.includes("America/Vancouver")) return "CAD";
    if (tz.includes("Asia/Dubai")) return "AED";
    if (tz.includes("Asia/Tokyo")) return "JPY";
    if (tz.includes("America/New_York") || tz.includes("America/Los_Angeles") || tz.includes("America/Chicago")) return "USD";

    // 2. Fallback to locale
    const locale = navigator.language || "";
    if (locale === "en-GB") return "GBP";
    if (locale.endsWith("AU")) return "AUD";
    if (locale.endsWith("CA")) return "CAD";
    if (locale.endsWith("JP")) return "JPY";
    if (locale.endsWith("IN")) return "INR";
    if (locale.endsWith("AE")) return "AED";
    if (locale.endsWith("CH")) return "CHF";
    if (locale.endsWith("SE")) return "SEK";
    if (locale.endsWith("NO")) return "NOK";
    if (locale.endsWith("DK")) return "DKK";
    if (locale.startsWith("fr") || locale.startsWith("de") || locale.startsWith("it") || locale.startsWith("es") || locale.startsWith("nl")) return "EUR";
    
  } catch (e) {
    console.error("Failed to guess user currency", e);
  }

  return "USD"; // Ultimate fallback
}
