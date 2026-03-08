// Currency utility functions
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  country: string[];
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    country: ['US', 'USA', 'United States']
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    country: ['IN', 'India']
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    country: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'GR', 'LU', 'MT', 'CY', 'SK', 'SI', 'EE', 'LV', 'LT']
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    country: ['GB', 'UK', 'United Kingdom']
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    country: ['AE', 'UAE', 'United Arab Emirates']
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    country: ['CA', 'Canada']
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    country: ['AU', 'Australia']
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    country: ['JP', 'Japan']
  }
};

// Approximate exchange rates (in a real app, you'd fetch these from an API)
export const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: {
    USD: 1,
    INR: 83.12,
    EUR: 0.92,
    GBP: 0.79,
    AED: 3.67,
    CAD: 1.36,
    AUD: 1.52,
    JPY: 149.50
  },
  INR: {
    USD: 0.012,
    INR: 1,
    EUR: 0.011,
    GBP: 0.0095,
    AED: 0.044,
    CAD: 0.016,
    AUD: 0.018,
    JPY: 1.80
  },
  EUR: {
    USD: 1.09,
    INR: 90.35,
    EUR: 1,
    GBP: 0.86,
    AED: 3.99,
    CAD: 1.48,
    AUD: 1.65,
    JPY: 162.80
  },
  GBP: {
    USD: 1.27,
    INR: 105.20,
    EUR: 1.16,
    GBP: 1,
    AED: 4.66,
    CAD: 1.72,
    AUD: 1.92,
    JPY: 189.50
  },
  AED: {
    USD: 0.272,
    INR: 22.67,
    EUR: 0.251,
    GBP: 0.214,
    AED: 1,
    CAD: 0.37,
    AUD: 0.41,
    JPY: 40.7
  }
};

/**
 * Get user's country based on various methods
 */
export const getUserCountry = async (): Promise<string> => {
  try {
    // Method 1: Try to get from browser's locale
    const locale = navigator.language || navigator.languages?.[0];
    if (locale) {
      const countryCode = locale.split('-')[1];
      if (countryCode) {
        return countryCode.toUpperCase();
      }
    }

    // Method 2: Try to get from timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Kolkata') || timezone.includes('Mumbai') || timezone.includes('Delhi')) {
      return 'IN';
    }
    if (timezone.includes('New_York') || timezone.includes('Los_Angeles') || timezone.includes('Chicago')) {
      return 'US';
    }
    if (timezone.includes('London')) {
      return 'GB';
    }
    if (timezone.includes('Berlin') || timezone.includes('Paris') || timezone.includes('Rome')) {
      return 'DE'; // Default to Germany for EUR
    }

    // Method 3: Try IP-based geolocation (fallback)
    try {
      const response = await fetch('https://ipapi.co/country_code/', {
        method: 'GET',
        headers: { 'Accept': 'text/plain' }
      });
      if (response.ok) {
        const countryCode = await response.text();
        return countryCode.trim().toUpperCase();
      }
    } catch (error) {
      console.warn('IP geolocation failed:', error);
    }

    // Default fallback
    return 'US';
  } catch (error) {
    console.error('Error detecting user country:', error);
    return 'US';
  }
};

/**
 * Get default currency for a country
 */
export const getCurrencyForCountry = (countryCode: string): string => {
  for (const [currency, info] of Object.entries(SUPPORTED_CURRENCIES)) {
    if (info.country.includes(countryCode)) {
      return currency;
    }
  }
  return 'USD'; // Default fallback
};

/**
 * Convert amount from one currency to another
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency];
  if (!rate) {
    console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    return amount;
  }

  return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
};

/**
 * Format currency amount with proper symbol and locale
 */
export const formatCurrencyAmount = (
  amount: number,
  currency: string,
  locale?: string
): string => {
  try {
    return new Intl.NumberFormat(locale || 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    const symbol = currencyInfo?.symbol || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
};

/**
 * Get user's preferred currency based on location
 */
export const getUserPreferredCurrency = async (): Promise<string> => {
  try {
    // Check if user has a saved preference
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
      return savedCurrency;
    }

    // Detect based on location
    const country = await getUserCountry();
    const currency = getCurrencyForCountry(country);
    
    // Save the detected currency as preference
    localStorage.setItem('preferredCurrency', currency);
    
    return currency;
  } catch (error) {
    console.error('Error getting user preferred currency:', error);
    return 'USD';
  }
};

/**
 * Set user's preferred currency
 */
export const setUserPreferredCurrency = (currency: string): void => {
  if (SUPPORTED_CURRENCIES[currency]) {
    localStorage.setItem('preferredCurrency', currency);
  }
};