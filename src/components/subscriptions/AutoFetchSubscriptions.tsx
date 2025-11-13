import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Mail,
  Zap,
  Calendar,
  CreditCard,
  Star,
  Crown,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Bell,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import toast from "react-hot-toast";

interface AutoFetchSubscriptionsProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AutoFetchSubscriptions: React.FC<AutoFetchSubscriptionsProps> = ({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  useAuth();
  const { userPlan } = useSubscriptionLimits();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle controlled/uncontrolled state
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const setIsOpen = controlledOnOpenChange || setOpen;

  const handleJoinWaitlist = async () => {
    setIsLoading(true);

    // Simulate API call to join waitlist
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(
        "You've been added to the waitlist! We'll notify you when this feature is available.",
      );
      setIsOpen(false);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    setIsOpen(false);
    window.location.href = "/pricing";
  };

  const isPremiumOrEnterprise =
    userPlan?.type === "premium" || userPlan?.type === "enterprise";
  const planName = userPlan?.type || "free";

  const emailProviders = [
    { name: "Gmail", icon: "📧", supported: true },
    { name: "Outlook", icon: "📨", supported: true },
    { name: "Yahoo Mail", icon: "📩", supported: true },
    { name: "Apple Mail", icon: "📬", supported: false },
    { name: "ProtonMail", icon: "🔐", supported: false },
  ];

  const features = [
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      title: "Smart Email Scanning",
      description: "AI-powered detection of subscription emails and receipts",
    },
    {
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      title: "Automatic Renewal Dates",
      description: "Extract and set renewal dates automatically from emails",
    },
    {
      icon: <CreditCard className="h-5 w-5 text-green-500" />,
      title: "Price Tracking",
      description: "Monitor price changes and get notified of increases",
    },
    {
      icon: <Bell className="h-5 w-5 text-purple-500" />,
      title: "Smart Notifications",
      description:
        "Get alerts for new subscriptions, cancellations, and renewals",
    },
    {
      icon: <Shield className="h-5 w-5 text-indigo-500" />,
      title: "Secure & Private",
      description: "Bank-level encryption with no email content stored",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Auto-Fetch Subscriptions
            <Badge variant="secondary" className="ml-2">
              <Clock className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Preview our upcoming AI-powered feature that will automatically
            detect and import subscriptions from your email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
            <div className="flex justify-center">
              <div className="relative">
                <Mail className="h-16 w-16 text-blue-500" />
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold">
              Never Miss a Subscription Again!
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Connect your email and let our AI automatically discover, track,
              and manage all your subscriptions. No more manual entry or
              forgotten renewals.
            </p>
          </div>

          {/* Plan Access Info */}
          <Card
            className={`border-2 ${isPremiumOrEnterprise ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-orange-200 bg-orange-50 dark:bg-orange-950/20"}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {isPremiumOrEnterprise ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Great! You have access to this feature.
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        This feature will be available to {planName} users
                        first.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Crown className="h-6 w-6 text-orange-500" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-900 dark:text-orange-100">
                        Premium Feature
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Upgrade to Premium or Enterprise to access auto-fetch
                        subscriptions.
                      </p>
                    </div>
                    <Button
                      onClick={handleUpgrade}
                      size="sm"
                      className="shrink-0"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Upgrade
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Supported Email Providers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Supported Email Providers</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {emailProviders.map((provider) => (
                <div
                  key={provider.name}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    provider.supported
                      ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                      : "bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800"
                  }`}
                >
                  <span className="text-2xl">{provider.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{provider.name}</p>
                    <Badge
                      variant={provider.supported ? "success" : "secondary"}
                      className="text-xs mt-1"
                    >
                      {provider.supported ? "Supported" : "Coming Soon"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">What You'll Get</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg"
                >
                  <div className="shrink-0 mt-0.5">{feature.icon}</div>
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium">1. Connect Email</h4>
                <p className="text-sm text-muted-foreground">
                  Securely connect your email account with OAuth
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium">2. AI Scanning</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI scans for subscription emails and receipts
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium">3. Auto-Import</h4>
                <p className="text-sm text-muted-foreground">
                  Subscriptions are automatically added to your dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Your Privacy is Our Priority
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    We only read email headers and subscription-related content.
                    No personal emails or sensitive information is stored. All
                    data is encrypted and you can revoke access anytime.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Be the First to Know</h3>
              <p className="text-muted-foreground">
                Join the waitlist and get early access when this feature
                launches.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleJoinWaitlist}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Join Waitlist
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {isPremiumOrEnterprise && (
              <p className="text-xs text-center text-muted-foreground">
                As a {planName} user, you'll get priority access when this
                feature launches.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutoFetchSubscriptions;
