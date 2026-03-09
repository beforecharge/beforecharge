import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Privacy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Account Information</h3>
              <p className="text-sm text-muted-foreground">
                When you create an account, we collect your email address and name to provide our services.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Gmail Access (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                If you choose to use our Gmail auto-fetch feature, we access your Gmail messages to detect
                subscription-related emails. We only read email headers and content to identify subscription
                information. We do not store your emails on our servers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Subscription Data</h3>
              <p className="text-sm text-muted-foreground">
                We store the subscription information you provide or that we detect from your emails,
                including service names, costs, billing cycles, and renewal dates.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>To provide and maintain our subscription tracking service</li>
              <li>To automatically detect subscriptions from your Gmail (with your permission)</li>
              <li>To send you renewal reminders and notifications</li>
              <li>To improve our service and develop new features</li>
              <li>To communicate with you about your account and our services</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We implement appropriate security measures to protect your personal information.
              Your data is stored securely using industry-standard encryption. We use Supabase
              for data storage and authentication, which provides enterprise-grade security.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gmail Data Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Limited Access</h3>
              <p className="text-sm text-muted-foreground">
                We only access Gmail messages that contain subscription-related keywords.
                We do not access personal emails, contacts, or other Gmail data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">No Storage</h3>
              <p className="text-sm text-muted-foreground">
                We do not store your Gmail messages. We only extract subscription information
                and immediately discard the email content.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">User Control</h3>
              <p className="text-sm text-muted-foreground">
                You can revoke Gmail access at any time through your Google Account settings
                or by disconnecting the integration in BeforeCharge.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Revoke Gmail access permissions</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <strong>Email:</strong> sparshmehta1001@gmail.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;