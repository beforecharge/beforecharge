import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Contact: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (window.history.length > 2) {
                    navigate(-1);
                } else {
                    navigate('/');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl relative min-h-screen">
            <button
                onClick={() => {
                    if (window.history.length > 2) {
                        navigate(-1);
                    } else {
                        navigate('/');
                    }
                }}
                className="fixed top-6 right-6 p-2 rounded-full bg-[#10121a] border border-white/10 text-muted-foreground hover:text-white hover:bg-white/5 transition-colors z-50 flex items-center justify-center"
            >
                <X className="h-5 w-5" />
            </button>

            <div className="space-y-6 pt-12">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
                    <p className="text-muted-foreground">We're here to help you take control of your subscriptions.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Get in Touch</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Email Support</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    For general inquiries, billing help, and feedback, please email our support team directly. We typically reply within 24 hours.
                                </p>
                                <a href="mailto:hello@beforecharge.com" className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                                    hello@beforecharge.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Feedback</h3>
                                <p className="text-sm text-muted-foreground">
                                    Have a feature request or found a bug? We'd love to hear from you. Your feedback helps us build a better platform.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Contact;
