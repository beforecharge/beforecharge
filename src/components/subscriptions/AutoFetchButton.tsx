import React from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useGmailAutoFetch, AutoFetchResult } from '@/hooks/useGmailAutoFetch';
import { Mail } from 'lucide-react';

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
  const { autoFetchWithToast, isLoading, isEnabled } = useGmailAutoFetch();

  const handleAutoFetch = async () => {
    try {
      const result = await autoFetchWithToast();
      onComplete?.(result);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (!isEnabled) {
    return null;
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