import { useState, useCallback, useEffect } from 'react';
import { gmailService } from '@/services/gmailService';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/supabase';
import toast from 'react-hot-toast';

export interface AutoFetchResult {
  added: number;
  total: number;
  limitReached?: boolean;
}

export const useGmailAutoFetch = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<AutoFetchResult | null>(null);
  const [hasGmailAccess, setHasGmailAccess] = useState(false);
  const [canFetch, setCanFetch] = useState(true);
  const [fetchCount, setFetchCount] = useState(0);

  // Check Gmail access and fetch limits on mount and when user changes
  const checkAccess = useCallback(async () => {
    if (user) {
      const access = await gmailService.hasGmailAccess();
      setHasGmailAccess(access);

      // Check fetch limits
      const fetchPermission = await gmailService.canUseFetch();
      setCanFetch(fetchPermission.allowed);
      setFetchCount(fetchPermission.fetchCount || 0);
    } else {
      setHasGmailAccess(false);
      setCanFetch(false);
      setFetchCount(0);
    }
  }, [user]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  const requestGmailAccess = useCallback(async () => {
    try {
      // Trigger Google OAuth with Gmail scopes
      await auth.signInWithGoogle();
    } catch (error) {
      console.error('Error requesting Gmail access:', error);
      throw error;
    }
  }, []);

  const autoFetch = useCallback(async (): Promise<AutoFetchResult> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user has Gmail access
    if (!hasGmailAccess) {
      throw new Error('GMAIL_ACCESS_REQUIRED');
    }

    // Check fetch limits
    if (!canFetch) {
      throw new Error('FETCH_LIMIT_REACHED');
    }

    setIsLoading(true);

    try {
      const result = await gmailService.autoFetchAndSaveSubscriptions();
      setLastResult(result);
      
      // Update fetch status after successful fetch
      const fetchPermission = await gmailService.canUseFetch();
      setCanFetch(fetchPermission.allowed);
      setFetchCount(fetchPermission.fetchCount || 0);
      
      return result;
    } catch (error) {
      console.error('Auto-fetch error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, hasGmailAccess, canFetch]);

  const autoFetchWithToast = useCallback(async (): Promise<AutoFetchResult> => {
    try {
      // Check if fetch limit reached
      if (!canFetch) {
        toast.error('Free plan: You already have 1 auto-detected subscription. Delete it to fetch again, or upgrade to Premium for unlimited.', { 
          id: 'auto-fetch',
          duration: 6000 
        });
        throw new Error('FETCH_LIMIT_REACHED');
      }

      // Check if Gmail access is required
      if (!hasGmailAccess) {
        toast.error('Gmail access required. Redirecting to sign in with Google...', { 
          id: 'auto-fetch',
          duration: 3000 
        });
        
        // Wait a moment for user to see the message
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Request Gmail access via Google OAuth
        await requestGmailAccess();
        return { added: 0, total: 0 };
      }

      toast.loading('Scanning your Gmail for subscriptions...', { id: 'auto-fetch' });

      const result = await autoFetch();

      if (result.limitReached && result.added === 1) {
        toast.success(
          `Added 1 subscription from Gmail. Free plan allows 1 auto-detected subscription - upgrade for unlimited!`,
          { id: 'auto-fetch', duration: 6000 }
        );
      } else if (result.limitReached && result.added === 0) {
        toast.success(
          `Found ${result.total} subscription${result.total > 1 ? 's' : ''} but they were already in your list. Free plan limit: 1 auto-fetch used.`,
          { id: 'auto-fetch', duration: 6000 }
        );
      } else if (result.added > 0) {
        toast.success(
          `Successfully added ${result.added} new subscription${result.added > 1 ? 's' : ''} from your Gmail!`,
          { id: 'auto-fetch' }
        );
      } else if (result.total > 0) {
        toast.success(
          `Found ${result.total} subscription${result.total > 1 ? 's' : ''} but they were already in your list`,
          { id: 'auto-fetch' }
        );
      } else {
        toast.success('No new subscriptions found in your Gmail', { id: 'auto-fetch' });
      }

      return result;

    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : (err?.message || '');
      
      if (errorMsg === 'FETCH_LIMIT_REACHED' || errorMsg === 'FREE_PLAN_LIMIT_REACHED') {
        toast.error('Free plan: You already have 1 auto-detected subscription. Delete it to fetch again, or upgrade to Premium.', { 
          id: 'auto-fetch',
          duration: 6000 
        });
      } else if (errorMsg === 'GMAIL_ACCESS_REQUIRED') {
        toast.error('Gmail access required. Redirecting to sign in with Google...', { 
          id: 'auto-fetch',
          duration: 3000 
        });
        
        // Wait a moment then request access
        setTimeout(() => {
          requestGmailAccess();
        }, 1500);
      } else if (errorMsg.includes('Gmail service not initialized') ||
        errorMsg.includes('No Google OAuth token')) {
        toast.error('Please sign in with Google to access Gmail', { id: 'auto-fetch' });
      } else if (errorMsg.includes('access_denied') ||
        errorMsg.includes('verification')) {
        toast.error('Gmail access requires verification. Please add yourself as a test user in Google Cloud Console.', {
          id: 'auto-fetch',
          duration: 6000
        });
      } else {
        toast.error(errorMsg || 'Failed to auto-fetch subscriptions', { id: 'auto-fetch' });
      }
      throw err;
    }
  }, [autoFetch, hasGmailAccess, canFetch, requestGmailAccess]);

  return {
    autoFetch,
    autoFetchWithToast,
    requestGmailAccess,
    refreshPermissions: checkAccess,
    isLoading,
    lastResult,
    hasGmailAccess,
    canFetch,
    fetchCount,
    isEnabled: !!user
  };
};