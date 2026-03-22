import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useGmailAutoFetch, AutoFetchResult } from '@/hooks/useGmailAutoFetch';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Mail, Chrome } from 'lucide-react';
import { trackEvent, ANALYTICS_EVENTS } from "@/utils/analytics";

interface AutoFetchButtonProps {
  onComplete?: (result: AutoFetchResult) => void;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const AutoFetchButton: React.FC<AutoFetchButtonProps> = ({
  onComplete,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const { autoFetchWithToast, requestGmailAccess, refreshPermissions, isLoading, isEnabled, hasGmailAccess, canFetch } = useGmailAutoFetch();
  const { subscriptions } = useSubscriptions();

  // Refresh permissions when subscriptions change (e.g., when one is deleted)
  useEffect(() => {
    refreshPermissions();
  }, [subscriptions.length, refreshPermissions]);

  const handleAutoFetch = async () => {
    try {
      trackEvent(ANALYTICS_EVENTS.AUTO_FETCH_CLICK);
      const result = await autoFetchWithToast();
      onComplete?.(result);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleConnectGmail = async () => {
    try {
      trackEvent(ANALYTICS_EVENTS.GOOGLE_AUTH_CLICK, { context: 'gmail-access' });
      await requestGmailAccess();
    } catch (error) {
      // Error handled by auth system
    }
  };

  if (!isEnabled) {
    return null;
  }

  // If user doesn't have Gmail access, show "Connect Gmail" button
  if (!hasGmailAccess) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleConnectGmail}
        disabled={isLoading}
        className={className}
      >
        <Chrome className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Connect Gmail</span>
        <span className="sm:hidden">Connect</span>
      </Button>
    );
  }

  // If fetch limit reached, show disabled button with message
  if (!canFetch) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled={true}
        className={className}
        title="Free plan: You have 1 auto-detected subscription. Delete it to fetch again."
      >
        <Mail className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Already Fetched (Delete to Re-fetch)</span>
        <span className="sm:hidden">Limit Reached</span>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAutoFetch}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          <span className="hidden sm:inline">Scanning...</span>
          <span className="sm:hidden">...</span>
        </>
      ) : (
        <>
          <Mail className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Auto-Fetch from Gmail</span>
          <span className="sm:hidden">Gmail Fetch</span>
        </>
      )}
    </Button>
  );
};

export default AutoFetchButton;