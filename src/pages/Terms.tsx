import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              By accessing and using MyRenewly, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              MyRenewly is a subscription management service that helps you track, manage, 
              and optimize your recurring subscription payments. We provide tools to manually 
              add subscriptions and optionally auto-detect them from your Gmail account.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Account Creation</h3>
              <p className="text-sm text-muted-foreground">
                You must provide accurate and complete information when creating an account. 
                You are responsible for maintaining the security of your account credentials.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Account Responsibility</h3>
              <p className="text-sm text-muted-foreground">
                You are responsible for all activities that occur under your account. 
                Please notify us immediately of any unauthorized use of your account.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gmail Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Optional Feature</h3>
              <p className="text-sm text-muted-foreground">
                Gmail integration is an optional feature that requires your explicit consent. 
                You can use MyRenewly without connecting your Gmail account.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Limited Access</h3>
              <p className="text-sm text-muted-foreground">
                When you grant Gmail access, we only read emails to detect subscription 
                information. We do not access other Gmail features or store your emails.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Revocation</h3>
              <p className="text-sm text-muted-foreground">
                You can revoke Gmail access at any time through your Google Account settings 
                or within the MyRenewly application.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acceptable Use</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You agree not to use MyRenewly for any unlawful purpose or in any way that 
              could damage, disable, or impair the service. Prohibited activities include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Attempting to gain unauthorized access to our systems</li>
              <li>Using the service to violate any applicable laws or regulations</li>
              <li>Interfering with or disrupting the service or servers</li>
              <li>Attempting to reverse engineer or copy our software</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              While we strive to provide accurate subscription detection from Gmail, 
              you are responsible for verifying the accuracy of all subscription information. 
              MyRenewly is a tool to assist with subscription management, not a financial advisor.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We strive to maintain high service availability but cannot guarantee 
              uninterrupted access. We may perform maintenance or updates that 
              temporarily affect service availability.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              MyRenewly is provided "as is" without warranties of any kind. We are not 
              liable for any damages arising from your use of the service, including 
              but not limited to missed subscription payments or inaccurate data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify 
              users of significant changes via email or through the application. 
              Continued use of the service constitutes acceptance of modified terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              <strong>Email:</strong> mehtasparsh777@gmail.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;