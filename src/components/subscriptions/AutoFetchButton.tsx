import React from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useGmailAutoFetch, AutoFetchResult } from '@/hooks/useGmailAutoFetch';
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
  const { autoFetchWithToast, requestGmailAccess, isLoading, isEnabled, hasGmailAccess, canFetch, fetchCount } = useGmailAutoFetch();

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
      console.error('Error connecting Gmail:', error);
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
        title="Free plan limit reached (1 fetch used). Upgrade to Premium for unlimited fetches."
      >
        <Mail className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Limit Reached ({fetchCount}/1)</span>
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