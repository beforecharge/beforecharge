import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { gmailService, EmailSubscription } from '@/services/gmailService';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Download, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface GmailAutoFetchProps {
  onSubscriptionsAdded?: (count: number) => void;
}

const GmailAutoFetch: React.FC<GmailAutoFetchProps> = ({ onSubscriptionsAdded }) => {
  const { user } = useAuth();
  const { addSubscription } = useSubscriptions();

  const [isScanning, setIsScanning] = useState(false);
  const [detectedSubscriptions, setDetectedSubscriptions] = useState<EmailSubscription[]>([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleScanEmails = async () => {
    if (!user) {
      toast.error('Please sign in to scan your emails');
      return;
    }

    setIsScanning(true);
    setDetectedSubscriptions([]);
    setSelectedSubscriptions(new Set());

    try {
      // Initialize Gmail service
      const initialized = await gmailService.initializeWithSupabaseToken();
      if (!initialized) {
        throw new Error('Failed to connect to Gmail. Please ensure you signed in with Google.');
      }

      toast.loading('Scanning your emails for subscriptions...', { id: 'gmail-scan' });

      // Search for subscription emails
      const messages = await gmailService.searchSubscriptionEmails(100);

      if (messages.length === 0) {
        toast.success('No subscription emails found', { id: 'gmail-scan' });
        return;
      }

      // Extract subscription information
      const subscriptions = await gmailService.extractSubscriptions(messages);

      setDetectedSubscriptions(subscriptions);

      // Auto-select high-confidence subscriptions
      const highConfidenceIndices = subscriptions
        .map((sub, index) => ({ sub, index }))
        .filter(({ sub }) => sub.confidence > 0.8)
        .map(({ index }) => index);

      setSelectedSubscriptions(new Set(highConfidenceIndices));

      toast.success(
        `Found ${subscriptions.length} potential subscriptions in your emails!`,
        { id: 'gmail-scan' }
      );

    } catch (error: any) {
      console.error('Gmail scan error:', error);
      toast.error(error.message || 'Failed to scan emails', { id: 'gmail-scan' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleToggleSubscription = (index: number) => {
    const newSelected = new Set(selectedSubscriptions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSubscriptions(newSelected);
  };

  const handleAddSelected = async () => {
    if (selectedSubscriptions.size === 0) {
      toast.error('Please select at least one subscription to add');
      return;
    }

    setIsAdding(true);
    let addedCount = 0;

    try {
      const selectedSubs = Array.from(selectedSubscriptions).map(index =>
        detectedSubscriptions[index]
      );

      for (const sub of selectedSubs) {
        try {
          await addSubscription({
            name: sub.serviceName,
            cost: sub.amount.toString(),
            currency: sub.currency as 'USD' | 'INR' | 'EUR' | 'GBP',
            billing_cycle: sub.billingCycle === 'yearly' ? 'annual' : sub.billingCycle as 'monthly' | 'weekly',
            renewal_date: sub.nextBilling?.toISOString().split('T')[0] || 
                              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category_id: '', // Will be set to default category by the hook
            description: `Auto-detected from Gmail (${Math.round(sub.confidence * 100)}% confidence)`,
            tags: [],
          });
          addedCount++;
        } catch (error) {
          console.error(`Failed to add subscription: ${sub.serviceName}`, error);
        }
      }

      if (addedCount > 0) {
        toast.success(`Successfully added ${addedCount} subscription${addedCount > 1 ? 's' : ''}!`);
        setDetectedSubscriptions([]);
        setSelectedSubscriptions(new Set());
        onSubscriptionsAdded?.(addedCount);
      } else {
        toast.error('Failed to add any subscriptions');
      }

    } catch (error) {
      console.error('Error adding subscriptions:', error);
      toast.error('Failed to add subscriptions');
    } finally {
      setIsAdding(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Gmail Auto-Fetch
        </CardTitle>
        <CardDescription>
          Automatically detect subscriptions from your Gmail emails. We'll scan for billing emails,
          invoices, and subscription confirmations to help you track all your recurring payments.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Scan Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleScanEmails}
            disabled={isScanning || !user}
            className="flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <LoadingSpinner size="sm" />
                Scanning Emails...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Scan Gmail for Subscriptions
              </>
            )}
          </Button>

          {detectedSubscriptions.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          )}
        </div>

        {!user && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Please sign in with Google to use the Gmail auto-fetch feature.
            </p>
          </div>
        )}

        {/* Detected Subscriptions */}
        {detectedSubscriptions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Detected Subscriptions ({detectedSubscriptions.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSubscriptions(new Set(detectedSubscriptions.map((_, i) => i)))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSubscriptions(new Set())}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {detectedSubscriptions.map((subscription, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedSubscriptions.has(index)}
                      onCheckedChange={() => handleToggleSubscription(index)}
                      className="mt-1"
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{subscription.serviceName}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getConfidenceColor(subscription.confidence)}>
                            {getConfidenceText(subscription.confidence)} ({Math.round(subscription.confidence * 100)}%)
                          </Badge>
                          <span className="font-semibold">
                            {subscription.currency} {subscription.amount}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{subscription.billingCycle}</span>
                        {subscription.nextBilling && (
                          <span>Next: {subscription.nextBilling.toLocaleDateString()}</span>
                        )}
                      </div>

                      {showDetails && (
                        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                          <p><strong>From:</strong> {subscription.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Add Selected Button */}
            {selectedSubscriptions.size > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm text-blue-800">
                  {selectedSubscriptions.size} subscription{selectedSubscriptions.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  onClick={handleAddSelected}
                  disabled={isAdding}
                  className="flex items-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Add Selected Subscriptions
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Privacy Notice */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Privacy & Security</p>
              <p>
                We only read email headers and content to detect subscriptions.
                No emails are stored or transmitted to our servers. All processing
                happens locally in your browser using your existing Google authentication.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GmailAutoFetch;