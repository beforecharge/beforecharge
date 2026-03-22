import { supabase } from '@/lib/supabase';
import type { DetectedSubscription } from './subscriptionDetector';

// Gmail API configuration
// PRIVACY NOTE: Gmail API calls are now processed server-side via /api/gmail/scan
// Email content is NOT visible in client's browser network tab
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// Legacy interface for backward compatibility
export interface EmailSubscription {
  serviceName: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly';
  nextBilling?: Date;
  email: string;
  confidence: number;
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

export interface ScanProgress {
  percent: number;
  message: string;
}

export interface ScanResult {
  subscriptions: DetectedSubscription[];
  emailsScanned: number;
  subsFound: number;
  subsNew: number;
  subsUpdated: number;
  scanDuration: number;
}

class GmailService {
  private accessToken: string | null = null;

  /**
   * Initialize Gmail API access using the existing Google OAuth token
   */
  async initializeWithSupabaseToken(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.provider_token) {
        return false;
      }

      this.accessToken = session.provider_token;
      return true;
    } catch (error) {
      console.error('Error initializing Gmail service:', error);
      return false;
    }
  }

  /**
   * Check if user has Gmail access
   */
  async hasGmailAccess(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.provider_token;
    } catch (error) {
      return false;
    }
  }

  /**
   * Main scan function - uses server-side API for privacy
   */
  async scanForSubscriptions(
    onProgress?: (progress: ScanProgress) => void
  ): Promise<ScanResult> {
    const startTime = Date.now();
    
    if (!this.accessToken) {
      const initialized = await this.initializeWithSupabaseToken();
      if (!initialized) {
        throw new Error('Gmail service not initialized');
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check plan limits (if applicable)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type, gmail_fetch_count')
        .eq('id', user.id)
        .single();

      const isFreePlan = !profile || (profile as any).plan_type === 'free';
      const fetchCount = (profile as any)?.gmail_fetch_count || 0;

      if (isFreePlan && fetchCount >= 1) {
        throw new Error('FREE_PLAN_LIMIT_REACHED');
      }
    } catch (error: any) {
      if (error?.message === 'FREE_PLAN_LIMIT_REACHED') {
        throw error;
      }
      // Continue if columns don't exist
    }

    onProgress?.({ percent: 10, message: 'Connecting to Gmail...' });

    // Call server-side API route for privacy
    try {
      const response = await fetch('/api/gmail/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: this.accessToken,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to scan Gmail');
      }

      const { subscriptions: detectedSubscriptions, emailsScanned, totalDetected } = await response.json();

      onProgress?.({ percent: 70, message: 'Processing results...' });

      const highConfidence = detectedSubscriptions || [];

      // Show helpful message if no subscriptions with prices found
      if (highConfidence.length === 0) {
        if (totalDetected && totalDetected > 0) {
          throw new Error(`Found ${totalDetected} potential subscriptions but couldn't extract prices. Try adding subscriptions manually.`);
        } else {
          throw new Error('No subscriptions detected in your Gmail. Try adding subscriptions manually.');
        }
      }

      onProgress?.({ percent: 85, message: 'Saving to database...' });

      // Save to database
      let subsNew = 0;
      let subsUpdated = 0;

      if (highConfidence.length > 0) {
        // Get existing subscriptions to avoid duplicates
        const { data: existingSubs } = await supabase
          .from('subscriptions')
          .select('name')
          .eq('user_id', user.id);

        const existingNames = new Set(
          (existingSubs || []).map(s => s.name.toLowerCase())
        );

        // Check if user is on free plan - limit to 1 new subscription
        let isFreePlan = true;
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan_type')
            .eq('id', user.id)
            .single();
          
          isFreePlan = !profile || (profile as any).plan_type === 'free';
        } catch (error) {
          // Default to free plan if error
        }

        const maxToAdd = isFreePlan ? 1 : highConfidence.length;
        let addedCount = 0;

        for (const sub of highConfidence) {
          // Stop if we've reached the limit for free plan
          if (isFreePlan && addedCount >= maxToAdd) {
            break;
          }

          // Skip if already exists
          if (existingNames.has(sub.serviceName.toLowerCase())) {
            subsUpdated++;
            continue;
          }

          // Skip if no amount detected (can't create subscription without price)
          if (!sub.amount || sub.amount <= 0) {
            continue;
          }

          // Build subscription data
          const subscriptionData: any = {
            user_id: user.id,
            name: sub.serviceName,
            category_id: await this.getCategoryId(user.id, sub.category),
            cost: sub.amount,
            currency: sub.currency,
            billing_cycle: sub.billingCycle,
            renewal_date: sub.nextChargeDate || new Date().toISOString().split('T')[0],
            is_active: true,
            description: `Auto-detected from Gmail (${sub.confidence}% confidence)`,
          };

          const { error } = await supabase
            .from('subscriptions')
            .insert(subscriptionData);

          if (!error) {
            subsNew++;
            addedCount++;
          }
        }
      }

      // Increment fetch count
      await this.incrementFetchCount(user.id);

      onProgress?.({ percent: 100, message: 'Done!' });

      const scanDuration = Date.now() - startTime;

      return {
        subscriptions: highConfidence,
        emailsScanned: emailsScanned || 0,
        subsFound: highConfidence.length,
        subsNew,
        subsUpdated,
        scanDuration,
      };

    } catch (error: any) {
      throw new Error(error.message || 'Failed to scan Gmail');
    }
  }

  /**
   * Get or create category ID
   */
  private async getCategoryId(userId: string, categoryName: string): Promise<string> {
    // Try to find existing category
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', categoryName)
      .single();

    if (existing) return existing.id;

    // Create new category
    const { data: newCat } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: categoryName,
        color: '#6366f1',
        icon: 'Package',
      })
      .select('id')
      .single();

    return newCat?.id || '';
  }

  /**
   * Increment Gmail fetch count
   */
  private async incrementFetchCount(userId: string): Promise<void> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('gmail_fetch_count')
        .eq('id', userId)
        .single();

      const currentCount = (profile as any)?.gmail_fetch_count || 0;

      await supabase
        .from('profiles')
        .update({
          gmail_fetch_count: currentCount + 1,
          gmail_last_fetch_at: new Date().toISOString(),
        } as any)
        .eq('id', userId);
    } catch (error: any) {
      if (!error?.message?.includes('column')) {
        console.error('Failed to increment fetch count:', error);
      }
    }
  }

  /**
   * Get required scopes
   */
  getRequiredScopes(): string[] {
    return [...GMAIL_SCOPES];
  }

  /**
   * Get scan statistics (returns null if function doesn't exist yet)
   */
  async getScanStatistics(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .rpc('get_scan_statistics' as any, { p_user_id: user.id });

      if (error) {
        console.log('Scan statistics function not available yet');
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.log('Scan statistics not available yet');
      return null;
    }
  }


  /**
   * Legacy method: Extract subscription information (DEPRECATED - use server-side API)
   */
  async extractSubscriptions(_messages: GmailMessage[]): Promise<EmailSubscription[]> {
    throw new Error('This method is deprecated. Use server-side scanning instead.');
  }

  /**
   * Legacy method for compatibility - wraps scanForSubscriptions
   */
  async autoFetchAndSaveSubscriptions(): Promise<{ added: number; total: number; limitReached?: boolean }> {
    const result = await this.scanForSubscriptions();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { added: result.subsNew, total: result.subsFound };
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type, gmail_fetch_count')
        .eq('id', user.id)
        .single();

      const isFreePlan = !profile || (profile as any).plan_type === 'free';
      const fetchCount = (profile as any)?.gmail_fetch_count || 0;
      const limitReached = isFreePlan && fetchCount >= 1;

      return { 
        added: result.subsNew, 
        total: result.subsFound,
        limitReached 
      };
    } catch (error) {
      return { added: result.subsNew, total: result.subsFound };
    }
  }

  /**
   * Check if user can use Gmail auto-fetch
   */
  async canUseFetch(): Promise<{ allowed: boolean; reason?: string; fetchCount?: number; hasAutoDetected?: boolean }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { allowed: false, reason: 'Not authenticated' };
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan_type, gmail_fetch_count')
          .eq('id', user.id)
          .single();

        const isFreePlan = !profile || (profile as any).plan_type === 'free';
        const fetchCount = (profile as any)?.gmail_fetch_count || 0;

        if (!isFreePlan) {
          return { allowed: true, fetchCount };
        }

        const { data: autoDetectedSubs } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .ilike('description', '%Auto-detected from Gmail%')
          .limit(1);

        const hasAutoDetected = (autoDetectedSubs && autoDetectedSubs.length > 0);

        if (hasAutoDetected) {
          return { 
            allowed: false, 
            reason: 'Free plan: 1 auto-detected subscription exists. Delete it to fetch again.', 
            fetchCount,
            hasAutoDetected: true
          };
        }

        return { allowed: true, fetchCount, hasAutoDetected: false };
      } catch (error: any) {
        if (error?.message?.includes('column')) {
          return { allowed: true, fetchCount: 0, hasAutoDetected: false };
        }
        throw error;
      }
    } catch (error) {
      return { allowed: false, reason: 'Error checking permissions' };
    }
  }
}

export const gmailService = new GmailService();
export default gmailService;
