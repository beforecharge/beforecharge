import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const Blog: React.FC = () => {
    return (
        <MainLayout>
            <div className="container mx-auto py-20 px-4">
                <h1 className="text-4xl font-bold mb-8">Blog & Updates</h1>
                <p className="text-lg text-muted-foreground mb-12">
                    Tips, tricks, and product updates from the BeforeCharge team.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {[
                        {
                            title: "How to save $500/year on streaming services",
                            date: "March 20, 2026",
                            excerpt: "Learn the secrets to auditing your streaming subscriptions and identifying what you actually use."
                        },
                        {
                            title: "The rise of the subscription economy",
                            date: "March 15, 2026",
                            excerpt: "Why everything is becoming a subscription and how to navigate this new financial landscape."
                        }
                    ].map((post, i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="aspect-video bg-muted rounded-xl mb-4 group-hover:opacity-80 transition-opacity"></div>
                            <p className="text-sm text-primary mb-2">{post.date}</p>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                            <p className="text-muted-foreground">{post.excerpt}</p>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
};

export default Blog;
