import React, { useEffect, useState } from "react";
import { User, Bell, Shield, Save, Eye, EyeOff, Globe } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import useSubscriptions from "@/hooks/useSubscriptions";
import { Currency } from "@/types/app.types";
import {
  SUPPORTED_CURRENCIES,
  getUserPreferredCurrency,
  setUserPreferredCurrency,
  getUserCountry,
  getCurrencyForCountry,
  formatCurrencyAmount,
} from "@/utils/currencyUtils";
import { DEFAULTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import LoadingSpinner from "@/components/ui/loading-spinner";
import CurrencyPreview from "@/components/ui/currency-preview";

const Settings: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { getActiveSubscriptions, getTotalMonthlyCost } = useSubscriptions();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<string>('');
  const [recommendedCurrency, setRecommendedCurrency] = useState<string>('');

  // Form states
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    email: user?.email || "",
    default_currency: profile?.default_currency || "USD",
    timezone: profile?.timezone || "UTC",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_reminders: profile?.notification_preferences?.email_reminders ?? true,
    push_notifications:
      profile?.notification_preferences?.push_notifications ?? false,
    trial_reminders: profile?.notification_preferences?.trial_reminders ?? true,
    price_change_alerts:
      profile?.notification_preferences?.price_change_alerts ?? true,
    reminder_days: profile?.notification_preferences?.reminder_days || [
      7, 3, 1,
    ],
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const activeCount = getActiveSubscriptions().length;
  const totalMonthlySpend = getTotalMonthlyCost();
  const displayCurrency = profile?.default_currency || DEFAULTS.currency;

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        // Get user's location and recommended currency
        const [country] = await Promise.all([
          getUserCountry(),
          getUserPreferredCurrency()
        ]);

        setDetectedCountry(country);
        const recommended = getCurrencyForCountry(country);
        setRecommendedCurrency(recommended);

        // Update profile data with detected currency if not set
        if (!profile?.default_currency && recommended) {
          setProfileData(prev => ({
            ...prev,
            default_currency: recommended as Currency
          }));
        }
      } catch (error) {
        console.error('Error initializing settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSettings();
  }, [profile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfile({
        full_name: profileData.full_name,
        default_currency: profileData.default_currency as any,
        timezone: profileData.timezone,
        notification_preferences: notificationSettings,
      });

      // Also update the local currency preference
      setUserPreferredCurrency(profileData.default_currency);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("New passwords do not match");
      return;
    }

    setIsSaving(true);
    try {
      // Password update logic would go here
      console.log("Password update requested");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Failed to update password:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" showText text="Loading settings..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="dash-cols relative flex-col-reverse lg:flex-row">
        <div className="flex-1 space-y-6">
          {/* Profile Settings */}
          <div className="panel">
            <div className="panel-top">
              <div className="panel-title">
                <div className="panel-title-ico" style={{ background: "var(--c-blue-bg)", color: "var(--c-blue)" }}>
                  <User className="h-4 w-4" />
                </div>
                Profile Information
              </div>
            </div>
            <div className="p-4">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      placeholder="Enter your full name"
                      className="bg-black border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-black/50 border-white/10 text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your email address
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      Default Currency
                      {detectedCountry && (
                        <span className="text-xs text-muted-foreground">
                          (Detected: {detectedCountry})
                        </span>
                      )}
                    </Label>
                    <select
                      id="currency"
                      value={profileData.default_currency}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          default_currency: e.target.value as Currency,
                        }))
                      }
                      className="flex h-10 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                        <option key={code} value={code}>
                          {code} ({info.symbol}) - {info.name}
                          {code === recommendedCurrency && ' (Recommended)'}
                        </option>
                      ))}
                    </select>
                    {recommendedCurrency && recommendedCurrency !== profileData.default_currency && (
                      <p className="text-xs text-primary">
                        💡 Based on your location, we recommend {SUPPORTED_CURRENCIES[recommendedCurrency].name} ({SUPPORTED_CURRENCIES[recommendedCurrency].symbol})
                      </p>
                    )}
                    <CurrencyPreview selectedCurrency={profileData.default_currency} className="mt-2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      value={profileData.timezone}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          timezone: e.target.value,
                        }))
                      }
                      className="flex h-10 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Kolkata">India Standard Time (IST)</option>
                      <option value="America/New_York">Eastern Time (US)</option>
                      <option value="America/Chicago">Central Time (US)</option>
                      <option value="America/Denver">Mountain Time (US)</option>
                      <option value="America/Los_Angeles">Pacific Time (US)</option>
                      <option value="Europe/London">London (GMT/BST)</option>
                      <option value="Europe/Paris">Paris (CET/CEST)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Asia/Shanghai">Shanghai (CST)</option>
                      <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isSaving} className="bg-primary text-black hover:bg-primary/90">
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2 border-black" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="panel">
            <div className="panel-top">
              <div className="panel-title">
                <div className="panel-title-ico" style={{ background: "var(--c-amber-bg)", color: "var(--c-amber)" }}>
                  <Bell className="h-4 w-4" />
                </div>
                Notification Preferences
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications about upcoming renewals
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.email_reminders}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      email_reminders: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-white/10 accent-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Trial Expiration Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when free trials are about to expire
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.trial_reminders}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      trial_reminders: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-white/10 accent-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Price Change Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify me when subscription prices change
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.price_change_alerts}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      price_change_alerts: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-white/10 accent-primary"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5 mt-4">
                <Label className="block mt-4">Reminder Timing</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  When should we remind you before renewals?
                </p>
                <div className="flex gap-4 flex-wrap">
                  {[1, 3, 7, 14, 30].map((days) => (
                    <label key={days} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.reminder_days.includes(
                          days as any,
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNotificationSettings((prev) => ({
                              ...prev,
                              reminder_days: [
                                ...prev.reminder_days,
                                days as any,
                              ],
                            }));
                          } else {
                            setNotificationSettings((prev) => ({
                              ...prev,
                              reminder_days: prev.reminder_days.filter(
                                (d) => d !== days,
                              ),
                            }));
                          }
                        }}
                        className="h-4 w-4 rounded border-white/10 accent-primary"
                      />
                      <span className="text-sm">
                        {days === 1 ? "1 day" : `${days} days`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="panel">
            <div className="panel-top">
              <div className="panel-title">
                <div className="panel-title-ico" style={{ background: "var(--c-red-bg)", color: "var(--c-red)" }}>
                  <Shield className="h-4 w-4" />
                </div>
                Security
              </div>
            </div>
            <div className="p-4">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.current_password}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          current_password: e.target.value,
                        }))
                      }
                      placeholder="Enter current password"
                      className="bg-black border-white/10 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            new_password: e.target.value,
                          }))
                        }
                        placeholder="Enter new password"
                        className="bg-black border-white/10 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirm_password: e.target.value,
                        }))
                      }
                      placeholder="Confirm new password"
                      className="bg-black border-white/10"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="outline"
                    className="border-white/10 bg-transparent hover:bg-white/5"
                    disabled={
                      !passwordData.current_password ||
                      !passwordData.new_password ||
                      !passwordData.confirm_password ||
                      isSaving
                    }
                  >
                    {isSaving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar Settings Area */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Account Stats */}
          <div className="panel">
            <div className="panel-top">
              <div className="panel-title">
                <div className="panel-title-ico" style={{ background: "var(--c-green-bg)", color: "var(--c-green)" }}>
                  <User className="h-4 w-4" />
                </div>
                Account Overview
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium text-white">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString(
                      "en-US",
                      { month: "short", year: "numeric" }
                    )
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Active subscriptions
                </span>
                <span className="font-medium text-white">{activeCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Monthly spending
                </span>
                <span className="font-medium text-primary">
                  {formatCurrencyAmount(totalMonthlySpend, displayCurrency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
