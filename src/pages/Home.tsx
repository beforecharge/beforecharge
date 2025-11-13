import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  TrendingUp,
  Bell,
  Shield,
  Clock,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Zap,
  Star,
  RefreshCw,
  PieChart,
  DollarSign,
  BellRing,
  FileText,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const features = [
    {
      icon: CreditCard,
      title: "Track All Subscriptions",
      description:
        "Manage all your recurring payments in one centralized dashboard",
      color: "text-blue-500",
    },
    {
      icon: TrendingUp,
      title: "Spending Analytics",
      description:
        "Visualize your subscription spending patterns and trends over time",
      color: "text-green-500",
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description:
        "Never miss a renewal or trial expiration with intelligent notifications",
      color: "text-purple-500",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description:
        "Your data is encrypted and secured with industry-standard protection",
      color: "text-red-500",
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description:
        "Stay informed with instant updates on your subscription status",
      color: "text-yellow-500",
    },
    {
      icon: BarChart3,
      title: "Detailed Reports",
      description:
        "Export comprehensive reports for expense tracking and budgeting",
      color: "text-indigo-500",
    },
  ];

  const benefits = [
    {
      title: "Save Money",
      description: "Identify unused subscriptions and optimize your spending",
      icon: DollarSign,
    },
    {
      title: "Save Time",
      description:
        "Manage everything from one dashboard instead of multiple accounts",
      icon: Clock,
    },
    {
      title: "Stay Organized",
      description: "Keep all subscription information organized and accessible",
      icon: FileText,
    },
    {
      title: "Never Forget",
      description: "Automated reminders ensure you never miss important dates",
      icon: BellRing,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      content:
        "This app saved me over $200 per month by identifying subscriptions I forgot I had!",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Freelancer",
      content:
        "The analytics features help me track my business expenses effortlessly.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Small Business Owner",
      content:
        "Finally, a simple way to manage all our company subscriptions in one place.",
      rating: 5,
    },
  ];

  const stats = [
    { label: "Active Users", value: "10,000+" },
    { label: "Subscriptions Tracked", value: "50,000+" },
    { label: "Money Saved", value: "$2M+" },
    { label: "Customer Satisfaction", value: "98%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  S
                </span>
              </div>
              <span className="text-xl font-bold">Subscription Manager</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                to="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="#testimonials"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Testimonials
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button onClick={() => navigate("/subscriptions")} size="sm">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/login")}
                    size="sm"
                  >
                    Sign In
                  </Button>
                  <Button onClick={() => navigate("/signup")} size="sm">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Trusted by 10,000+ users worldwide
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Take Control of Your
              <span className="text-primary block mt-2">
                Subscription Chaos
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stop wasting money on forgotten subscriptions. Track, manage, and
              optimize all your recurring payments in one intelligent dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate(user ? "/subscriptions" : "/signup")}
                className="text-lg px-8 py-6"
              >
                {user ? "Go to Dashboard" : "Start Free Trial"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/pricing")}
                className="text-lg px-8 py-6"
              >
                View Pricing
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-8 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful features to help you manage subscriptions like a pro
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <CardHeader>
                    <div
                      className={`h-12 w-12 rounded-lg ${feature.color} bg-current/10 flex items-center justify-center mb-4`}
                    >
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why Choose Our
                <span className="text-primary"> Subscription Manager?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of users who have already taken control of their
                digital subscriptions and saved money in the process.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{benefit.title}</h3>
                        <p className="text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="col-span-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">$89.99</p>
                      <p className="text-sm text-muted-foreground">
                        Average monthly savings
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <RefreshCw className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="font-semibold">Auto-Sync</p>
                  <p className="text-sm text-muted-foreground">
                    Real-time updates
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <PieChart className="h-8 w-8 text-purple-500 mb-2" />
                  <p className="font-semibold">Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Detailed insights
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold">Loved by Users</h2>
            <p className="text-xl text-muted-foreground">
              See what our customers have to say about their experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-500 text-yellow-500"
                      />
                    ))}
                  </div>
                  <CardDescription className="text-base">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to Take Control?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of users who are already saving money and time
                with our subscription manager.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate(user ? "/subscriptions" : "/signup")}
                  className="text-lg px-8"
                >
                  {user ? "Go to Dashboard" : "Start Your Free Trial"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/pricing")}
                  className="text-lg px-8"
                >
                  View Pricing Plans
                </Button>
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                  14-day free trial
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                  Cancel anytime
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-muted-foreground">
                © 2024 Subscription Manager. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
              <Link
                to="/support"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Support
              </Link>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>Powered by</span>
              <span className="font-semibold text-foreground">ZodeNexus</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
