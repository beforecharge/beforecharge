import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const Features: React.FC = () => {
    return (
        <MainLayout>
            <div className="container mx-auto py-20 px-4">
                <h1 className="text-4xl font-bold mb-8">Features</h1>
                <p className="text-lg text-muted-foreground mb-12">
                    Discover how BeforeCharge helps you master your subscriptions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { title: 'Smart Detection', desc: 'Automatically find subscriptions in your inbox.' },
                        { title: 'Advance Alerts', desc: 'Get notified 3 days before any charge.' },
                        { title: 'Renewal Calendar', desc: 'Visualize your upcoming payments.' },
                        { title: 'Trial Tracker', desc: 'Never miss a free trial expiration.' },
                        { title: 'Spend Analytics', desc: 'Detailed reports on your spending habits.' },
                        { title: 'Global Support', desc: 'Multi-currency support for users worldwide.' },
                    ].map((feat, i) => (
                        <div key={i} className="p-6 bg-card border border-border rounded-xl">
                            <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
                            <p className="text-muted-foreground">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
};

export default Features;
