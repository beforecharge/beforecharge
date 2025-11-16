import { useState, useCallback } from 'react';
import { gmailService } from '@/services/gmailService';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export interface AutoFetchResult {
  added: number;
  total: number;
}

export const useGmailAutoFetch = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<AutoFetchResult | null>(null);

  const autoFetch = useCallback(async (): Promise<AutoFetchResult> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    
    try {
      const result = await gmailService.autoFetchAndSaveSubscriptions();
      setLastResult(result);
      return result;
    } catch (error) {
      console.error('Auto-fetch error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const autoFetchWithToast = useCallback(async (): Promise<AutoFetchResult> => {
    try {
      toast.loading('Scanning your Gmail for subscriptions...', { id: 'auto-fetch' });
      
      const result = await autoFetch();
      
      if (result.added > 0) {
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
      
    } catch (error: any) {
      if (error.message.includes('Gmail service not initialized') || 
          error.message.includes('No Google OAuth token')) {
        toast.error('Please sign in with Google to access Gmail', { id: 'auto-fetch' });
      } else if (error.message.includes('access_denied') || 
                 error.message.includes('verification')) {
        toast.error('Gmail access requires verification. Please add yourself as a test user in Google Cloud Console.', { 
          id: 'auto-fetch',
          duration: 6000
        });
      } else {
        toast.error(error.message || 'Failed to auto-fetch subscriptions', { id: 'auto-fetch' });
      }
      throw error;
    }
  }, [autoFetch]);

  return {
    autoFetch,
    autoFetchWithToast,
    isLoading,
    lastResult,
    isEnabled: !!user && import.meta.env.VITE_ENABLE_GMAIL_AUTOFETCH === 'true'
  };
};