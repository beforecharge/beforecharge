import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { usePayment } from '@/hooks/usePayment';
import { PlanType } from '@/types/payment.types';
import { PLANS, YEARLY_PLANS } from '@/lib/constants';
import toast from 'react-hot-toast';

interface LemonSqueezyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: PlanType;
  currency: 'USD' | 'INR';
  billingInterval: 'monthly' | 'yearly';
}

const LemonSqueezyPaymentModal: React.FC<LemonSqueezyPaymentModalProps> = ({
  isOpen,
  onClose,
  planType,
  currency,
  billingInterval,
}) => {
  const { user } = useAuth();
  const { createCheckout, isProcessing } = usePayment();

  // Get plan details
  const plans = billingInterval === 'yearly' ? YEARLY_PLANS : PLANS;
  const plan = plans.find(p => p.type === planType);
  const amount = plan?.price[currency.toLowerCase() as 'usd' | 'inr'] || 0;
  const planName = plan?.name || '';

  const handleCheckout = async () => {
    if (!user || !plan) {
      toast.error('Please sign in to continue');
      return;
    }

    try {
      const checkoutResponse = await createCheckout({
        planType,
        currency,
        userId: user.id,
        billingInterval,
      });
      
      if (checkoutResponse?.checkoutUrl) {
        // Redirect to LemonSqueezy checkout
        window.location.href = checkoutResponse.checkoutUrl;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Subscribe to {planName} for {currency === 'USD' ? '$' : '₹'}{amount}/{billingInterval === 'yearly' ? 'year' : 'month'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Plan</span>
              <span className="font-medium">{planName}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Billing</span>
              <span className="font-medium capitalize">{billingInterval}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-bold text-lg">
                {currency === 'USD' ? '$' : '₹'}{amount}
              </span>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              'Continue to Checkout'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by LemonSqueezy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LemonSqueezyPaymentModal;
