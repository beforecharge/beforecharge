import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

/**
 * DEPRECATED: This component used client-side Gmail scanning which exposed email data.
 * Use AutoFetchButton component instead, which uses server-side scanning for privacy.
 */
interface GmailAutoFetchProps {
  onSubscriptionsAdded?: (count: number) => void;
}

const GmailAutoFetch: React.FC<GmailAutoFetchProps> = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gmail Auto-Fetch (Deprecated)</CardTitle>
        <CardDescription>
          This component has been replaced with a more secure server-side implementation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <p className="font-medium mb-2">Component Deprecated</p>
              <p>
                This manual selection interface has been replaced with automatic server-side 
                scanning for better privacy. Use the "Auto-Fetch from Gmail" button instead.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GmailAutoFetch;
