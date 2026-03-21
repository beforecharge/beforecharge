import React, { useState } from "react";
import { Calendar as CalendarIcon, Bell, Zap, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { trackEvent, ANALYTICS_EVENTS } from "@/utils/analytics";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useSubscriptions from "@/hooks/useSubscriptions";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrencyAmount, convertCurrency } from "@/utils/currencyUtils";
import { DEFAULTS } from "@/lib/constants";

const CalendarPage: React.FC = () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { subscriptions } = useSubscriptions();
    const { profile } = useAuth();

    const displayCurrency = profile?.default_currency || DEFAULTS.currency;

    // Filter active subscriptions
    const activeSubs = subscriptions.filter(sub => sub.is_active);

    // Group subscriptions by renewal date (ignoring year/month for monthly, or matching month for yearly)
    // For simplicity of the "upcoming" view, let's just use the `renewal_date` directly 
    // and assume it's the next upcoming date as maintained by the DB.

    const selectedDateString = date ? date.toISOString().split('T')[0] : "";
    const selectedMonth = date ? date.getMonth() : new Date().getMonth();
    const selectedYear = date ? date.getFullYear() : new Date().getFullYear();

    const upcomingInSelectedMonth = activeSubs.filter(sub => {
        const renewalDate = new Date(sub.renewal_date);
        return renewalDate.getMonth() === selectedMonth && renewalDate.getFullYear() === selectedYear;
    }).sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime());

    const totalCostThisMonth = upcomingInSelectedMonth.reduce((acc, sub) => {
        return acc + convertCurrency(sub.cost, sub.currency, displayCurrency);
    }, 0);

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Renewal Calendar</h1>
                    <p className="text-muted-foreground mt-1">
                        Visualize your upcoming subscription renewals and scheduled charges.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
                {/* Calendar View */}
                <Card className="border-white/5 bg-black/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            Monthly Overview
                        </CardTitle>
                        <CardDescription>
                            Select a date to see scheduled renewals.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center p-6 pb-8">
                        <div className="p-4 rounded-xl border border-white/10 bg-black/20 w-full max-w-[320px] flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border-none p-0"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary" />
                                Intelligent Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-2">
                                <p className="text-sm font-medium">Coming Features:</p>
                                <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                                    <li>Automatic sync with Gmail invoices</li>
                                    <li>Multi-currency cost aggregation</li>
                                    <li>One-click cancellation guides</li>
                                    <li>Shared subscription tracking</li>
                                </ul>
                            </div>
                            <Button
                                className="w-full bg-primary text-black hover:bg-primary/90 font-bold"
                                onClick={() => {
                                    toast.success("Notification set! We'll alert you when the Calendar is live.");
                                    trackEvent(ANALYTICS_EVENTS.CALENDAR_NOTIFY_CLICK);
                                }}
                            >
                                <Bell className="h-4 w-4 mr-2" />
                                Notify Me on Release
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-white/5 bg-black/20">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <DollarSign className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold">Monthly Est. for Selected Month</h4>
                                    <p className="text-xl font-bold text-white mt-1">
                                        {formatCurrencyAmount(totalCostThisMonth, displayCurrency)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Based on {upcomingInSelectedMonth.length} scheduled renewals.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Subscriptions List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                    Renewals in {date ? date.toLocaleString('default', { month: 'long', year: 'numeric' }) : "Selected Month"}
                </h3>
                {upcomingInSelectedMonth.length === 0 ? (
                    <div className="p-8 text-center border rounded-lg border-white/5 bg-black/20 text-muted-foreground">
                        No renewals scheduled for this month.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingInSelectedMonth.map((sub) => {
                            const isSelectedDate = sub.renewal_date === selectedDateString;
                            return (
                                <Card
                                    key={sub.id}
                                    className={`border-white/5 transition-colors ${isSelectedDate ? 'bg-primary/20 border-primary/50' : 'bg-black/40 hover:bg-black/60'}`}
                                >
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs">
                                                {sub.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{sub.name}</p>
                                                <p className={`text-xs ${isSelectedDate ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {new Date(sub.renewal_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {sub.currency !== displayCurrency ? (
                                                <>
                                                    <div className="text-sm font-semibold">
                                                        {formatCurrencyAmount(convertCurrency(sub.cost, sub.currency, displayCurrency), displayCurrency)}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        ({formatCurrencyAmount(sub.cost, sub.currency)})
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-sm font-semibold">
                                                    {formatCurrencyAmount(sub.cost, sub.currency)}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarPage;
