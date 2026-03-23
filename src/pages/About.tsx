import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const About: React.FC = () => {
    return (
        <MainLayout>
            <div className="container mx-auto py-20 px-4 max-w-3xl">
                <h1 className="text-4xl font-bold mb-8">About BeforeCharge</h1>
                <div className="prose prose-invert lg:prose-xl">
                    <p>
                        BeforeCharge was born out of a simple frustration: being surprised by subscription charges you forgot about.
                    </p>
                    <p>
                        We believe that you should always be in control of your money. Our mission is to provide transparency and awareness for every recurring payment in your life.
                    </p>
                    <p>
                        Founded in 2026, we've already helped thousands of users save millions of dollars by identifying and cancelling unwanted subscriptions before they charge.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
};

export default About;
