import { supabase } from '@/lib/supabase';
import { getUserPreferredCurrency, convertCurrency } from '@/utils/currencyUtils';

// Gmail API configuration
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

/**
 * Get the required Gmail API scopes
 */
export function getRequiredScopes(): string[] {
  return [...GMAIL_SCOPES];
}

export interface EmailSubscription {
  serviceName: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly';
  nextBilling?: Date;
  email: string;
  confidence: number; // 0-1 score of how confident we are this is a subscription
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{ body?: { data?: string }; mimeType: string }>;
  };
  internalDate: string;
}

class GmailService {
  private accessToken: string | null = null;
  private userPreferredCurrency: string | null = null;

  /**
   * Initialize Gmail API access using the existing Google OAuth token
   */
  async initializeWithSupabaseToken(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.provider_token) {
        throw new Error('No Google OAuth token found. Please sign in with Google first.');
      }

      // Validate that we have the required scopes (informational)
      console.log('Required Gmail scopes:', GMAIL_SCOPES);

      this.accessToken = session.provider_token;

      // Initialize user's preferred currency
      this.userPreferredCurrency = await getUserPreferredCurrency();

      return true;
    } catch (error) {
      console.error('Failed to initialize Gmail service:', error);
      return false;
    }
  }

  /**
   * Search for subscription-related emails
   */
  async searchSubscriptionEmails(maxResults: number = 50): Promise<GmailMessage[]> {
    if (!this.accessToken) {
      throw new Error('Gmail service not initialized');
    }

    // Search queries for common subscription patterns
    const searchQueries = [
      'subject:(subscription OR billing OR invoice OR receipt OR payment)',
      'from:(noreply OR billing OR subscriptions OR payments)',
      'subject:(monthly OR yearly OR annual OR recurring)',
      'body:(subscription OR billing cycle OR next payment OR auto-renew)'
    ];

    const allMessages: GmailMessage[] = [];

    for (const query of searchQueries) {
      try {
        const response = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${Math.ceil(maxResults / searchQueries.length)}`,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.warn(`Gmail search failed for query: ${query}`, response.status);
          continue;
        }

        const data = await response.json();

        if (data.messages) {
          // Get full message details
          const messageDetails = await Promise.all(
            data.messages.slice(0, 10).map((msg: { id: string }) =>
              this.getMessageDetails(msg.id)
            )
          );

          allMessages.push(...messageDetails.filter(Boolean));
        }
      } catch (error) {
        console.error(`Error searching emails with query: ${query}`, error);
      }
    }

    return allMessages;
  }

  /**
   * Get detailed message information
   */
  private async getMessageDetails(messageId: string): Promise<GmailMessage | null> {
    try {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching message ${messageId}:`, error);
      return null;
    }
  }

  /**
   * Extract subscription information from email messages
   */
  async extractSubscriptions(messages: GmailMessage[]): Promise<EmailSubscription[]> {
    const subscriptions: EmailSubscription[] = [];

    for (const message of messages) {
      try {
        const subscription = await this.parseSubscriptionFromMessage(message);
        if (subscription && subscription.confidence > 0.6) {
          subscriptions.push(subscription);
        }
      } catch (error) {
        console.error('Error parsing subscription from message:', error);
      }
    }

    // Remove duplicates based on service name and amount
    return this.deduplicateSubscriptions(subscriptions);
  }

  /**
   * Parse subscription information from a single email message
   */
  private async parseSubscriptionFromMessage(message: GmailMessage): Promise<EmailSubscription | null> {
    const headers = message.payload.headers;
    const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
    const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';

    // Get email body
    const body = this.extractEmailBody(message);
    const fullText = `${subject} ${body}`.toLowerCase();

    // Extract service name
    const serviceName = this.extractServiceName(from, subject, body);
    if (!serviceName) return null;

    // Extract amount and currency
    const { amount, currency } = this.extractAmountAndCurrency(fullText);
    if (!amount) return null;

    // Extract billing cycle
    const billingCycle = this.extractBillingCycle(fullText);

    // Extract next billing date
    const nextBilling = this.extractNextBillingDate(fullText);

    // Calculate confidence score
    const confidence = this.calculateConfidence(fullText, serviceName, amount, billingCycle);

    return {
      serviceName,
      amount,
      currency,
      billingCycle,
      nextBilling,
      email: from,
      confidence
    };
  }

  /**
   * Extract email body text
   */
  private extractEmailBody(message: GmailMessage): string {
    let body = '';

    // Try to get body from main payload
    if (message.payload.body?.data) {
      body = this.decodeBase64(message.payload.body.data);
    }

    // Try to get body from parts
    if (!body && message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = this.decodeBase64(part.body.data);
          break;
        }
      }
    }

    return body;
  }

  /**
   * Decode base64 email content
   */
  private decodeBase64(data: string): string {
    try {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (error) {
      console.error('Error decoding base64:', error);
      return '';
    }
  }

  /**
   * Extract service name from email
   */
  private extractServiceName(from: string, subject: string, body: string): string | null {
    // Common service patterns
    const servicePatterns = [
      // From email domain
      /from.*@([a-zA-Z0-9-]+)\.(com|net|org|io)/i,
      // Subject patterns
      /your ([a-zA-Z0-9\s]+) subscription/i,
      /([a-zA-Z0-9\s]+) billing/i,
      /([a-zA-Z0-9\s]+) invoice/i,
      // Body patterns
      /thank you for your ([a-zA-Z0-9\s]+) subscription/i,
    ];

    for (const pattern of servicePatterns) {
      const match = `${from} ${subject} ${body}`.match(pattern);
      if (match && match[1]) {
        return this.cleanServiceName(match[1]);
      }
    }

    // Fallback: extract from email domain
    const domainMatch = from.match(/@([a-zA-Z0-9-]+)\./);
    if (domainMatch) {
      return this.cleanServiceName(domainMatch[1]);
    }

    return null;
  }

  /**
   * Clean and normalize service name
   */
  private cleanServiceName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Extract amount and currency from text with location-based priority
   */
  private extractAmountAndCurrency(text: string): { amount: number | null; currency: string } {
    const userCurrency = this.userPreferredCurrency || 'USD';

    // Enhanced currency patterns with better detection
    const currencyPatterns = [
      // Indian Rupee patterns (prioritize for Indian users)
      { pattern: /₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g, currency: 'INR' },
      { pattern: /(?:rs\.?\s*|rupees?\s*)(\d+(?:,\d+)*(?:\.\d{2})?)/gi, currency: 'INR' },
      { pattern: /(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:inr|₹)/gi, currency: 'INR' },

      // US Dollar patterns
      { pattern: /\$\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g, currency: 'USD' },
      { pattern: /(\d+(?:,\d+)*(?:\.\d{2})?)\s*usd/gi, currency: 'USD' },

      // Euro patterns
      { pattern: /€\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g, currency: 'EUR' },
      { pattern: /(\d+(?:,\d+)*(?:\.\d{2})?)\s*eur/gi, currency: 'EUR' },

      // British Pound patterns
      { pattern: /£\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g, currency: 'GBP' },
      { pattern: /(\d+(?:,\d+)*(?:\.\d{2})?)\s*gbp/gi, currency: 'GBP' },

      // Canadian Dollar patterns
      { pattern: /(?:c\$|cad\$)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/gi, currency: 'CAD' },
      { pattern: /(\d+(?:,\d+)*(?:\.\d{2})?)\s*cad/gi, currency: 'CAD' },

      // Australian Dollar patterns
      { pattern: /(?:a\$|aud\$)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/gi, currency: 'AUD' },
      { pattern: /(\d+(?:,\d+)*(?:\.\d{2})?)\s*aud/gi, currency: 'AUD' },

      // Japanese Yen patterns
      { pattern: /¥\s*(\d+(?:,\d+)*)/g, currency: 'JPY' },
      { pattern: /(\d+(?:,\d+)*)\s*jpy/gi, currency: 'JPY' },
    ];

    // First, try to find amounts in user's preferred currency
    const preferredCurrencyPatterns = currencyPatterns.filter(p => p.currency === userCurrency);
    for (const { pattern, currency } of preferredCurrencyPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const amountStr = matches[0][1].replace(/,/g, ''); // Remove commas
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          return { amount, currency };
        }
      }
    }

    // Then try all other currencies
    const otherCurrencyPatterns = currencyPatterns.filter(p => p.currency !== userCurrency);
    for (const { pattern, currency } of otherCurrencyPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const amountStr = matches[0][1].replace(/,/g, ''); // Remove commas
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          // Convert to user's preferred currency
          const convertedAmount = convertCurrency(amount, currency, userCurrency);
          return { amount: convertedAmount, currency: userCurrency };
        }
      }
    }

    return { amount: null, currency: userCurrency };
  }

  /**
   * Extract billing cycle from text
   */
  private extractBillingCycle(text: string): 'monthly' | 'yearly' | 'weekly' {
    if (text.includes('annual') || text.includes('yearly') || text.includes('year')) {
      return 'yearly';
    }
    if (text.includes('weekly') || text.includes('week')) {
      return 'weekly';
    }
    return 'monthly'; // Default
  }

  /**
   * Extract next billing date
   */
  private extractNextBillingDate(text: string): Date | undefined {
    const datePatterns = [
      /next billing date:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /renews on:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /due date:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const date = new Date(match[1]);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return undefined;
  }

  /**
   * Calculate confidence score for subscription detection
   */
  private calculateConfidence(text: string, serviceName: string, amount: number, billingCycle: string): number {
    let confidence = 0;

    // Base confidence for having service name and amount
    if (serviceName && amount) confidence += 0.4;

    // Subscription keywords
    const subscriptionKeywords = ['subscription', 'billing', 'recurring', 'auto-renew', 'monthly', 'yearly'];
    const keywordMatches = subscriptionKeywords.filter(keyword => text.includes(keyword)).length;
    confidence += (keywordMatches / subscriptionKeywords.length) * 0.3;

    // Amount reasonableness (between $1 and $1000)
    if (amount >= 1 && amount <= 1000) confidence += 0.2;

    // Billing cycle detection
    if (billingCycle !== 'monthly') confidence += 0.1; // Bonus for detecting specific cycle

    return Math.min(confidence, 1);
  }

  /**
   * Remove duplicate subscriptions
   */
  private deduplicateSubscriptions(subscriptions: EmailSubscription[]): EmailSubscription[] {
    const seen = new Set<string>();
    return subscriptions.filter(sub => {
      const key = `${sub.serviceName.toLowerCase()}-${sub.amount}-${sub.currency}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Auto-fetch and save subscriptions to database
   */
  async autoFetchAndSaveSubscriptions(): Promise<{ added: number; total: number }> {
    try {
      // Initialize Gmail service
      const initialized = await this.initializeWithSupabaseToken();
      if (!initialized) {
        throw new Error('Failed to initialize Gmail service');
      }

      // Search for subscription emails
      const messages = await this.searchSubscriptionEmails(100);

      if (messages.length === 0) {
        return { added: 0, total: 0 };
      }

      // Extract subscription information
      const detectedSubscriptions = await this.extractSubscriptions(messages);

      if (detectedSubscriptions.length === 0) {
        return { added: 0, total: 0 };
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get default category (create if doesn't exist)
      let { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Auto-Detected')
        .single();

      if (!categories) {
        const { data: newCategory } = await supabase
          .from('categories')
          .insert({
            name: 'Auto-Detected',
            user_id: user.id,
            color: '#6366f1',
            icon: 'Mail'
          })
          .select('id')
          .single();

        categories = newCategory;
      }

      // Check for existing subscriptions to avoid duplicates
      const { data: existingSubscriptions } = await supabase
        .from('subscriptions')
        .select('name, cost, currency')
        .eq('user_id', user.id);

      const existingKeys = new Set(
        existingSubscriptions?.map(sub =>
          `${sub.name.toLowerCase()}-${sub.cost}-${sub.currency}`
        ) || []
      );

      // Filter out duplicates and low-confidence subscriptions
      const subscriptionsToAdd = detectedSubscriptions.filter(sub => {
        const key = `${sub.serviceName.toLowerCase()}-${sub.amount}-${sub.currency}`;
        return !existingKeys.has(key) && sub.confidence > 0.7;
      });

      let addedCount = 0;

      // Add subscriptions to database
      for (const sub of subscriptionsToAdd) {
        try {
          const { error } = await supabase
            .from('subscriptions')
            .insert({
              user_id: user.id,
              name: sub.serviceName,
              cost: sub.amount,
              currency: sub.currency,
              billing_cycle: sub.billingCycle === 'yearly' ? 'annual' : sub.billingCycle,
              renewal_date: sub.nextBilling?.toISOString().split('T')[0] ||
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              category_id: categories?.id || '',
              description: `Auto-detected from Gmail (${Math.round(sub.confidence * 100)}% confidence)`,
              is_active: true,

            });

          if (!error) {
            addedCount++;
          }
        } catch (error) {
          console.error(`Failed to add subscription: ${sub.serviceName}`, error);
        }
      }

      return { added: addedCount, total: detectedSubscriptions.length };

    } catch (error) {
      console.error('Auto-fetch error:', error);
      throw error;
    }
  }
}

export const gmailService = new GmailService();