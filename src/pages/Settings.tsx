import React, { useEffect, useState } from "react";
import { User, Bell, Palette, Shield, Save, Eye, EyeOff, Globe } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { Currency } from "@/types/app.types";
import { 
  SUPPORTED_CURRENCIES, 
  getUserPreferredCurrency, 
  setUserPreferredCurrency,
  getUserCountry,
  getCurrencyForCountry 
} from "@/utils/currencyUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import CurrencyPreview from "@/components/ui/currency-preview";

const Settings: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { theme, setTheme } = useUIStore();

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your email address
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                        <option key={code} value={code}>
                          {code} ({info.symbol}) - {info.name}
                          {code === recommendedCurrency && ' (Recommended)'}
                        </option>
                      ))}
                    </select>
                    {recommendedCurrency && recommendedCurrency !== profileData.default_currency && (
                      <p className="text-xs text-blue-600">
                        💡 Based on your location, we recommend {SUPPORTED_CURRENCIES[recommendedCurrency].name} ({SUPPORTED_CURRENCIES[recommendedCurrency].symbol})
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      This currency will be used for displaying all subscription costs and when auto-fetching from Gmail.
                    </p>
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
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
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>
                Choose how you want to be notified about your subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                    className="h-4 w-4"
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
                    className="h-4 w-4"
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
                    className="h-4 w-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reminder Timing</Label>
                  <p className="text-sm text-muted-foreground">
                    When should we remind you before renewals?
                  </p>
                  <div className="flex gap-2 flex-wrap">
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
                          className="h-4 w-4"
                        />
                        <span className="text-sm">
                          {days === 1 ? "1 day" : `${days} days`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                Update your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <div className="mt-2 space-y-2">
                    {[
                      { value: "light", label: "Light", emoji: "☀️" },
                      { value: "dark", label: "Dark", emoji: "🌙" },
                      { value: "system", label: "System", emoji: "💻" },
                    ].map((themeOption) => (
                      <label
                        key={themeOption.value}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="radio"
                          name="theme"
                          value={themeOption.value}
                          checked={theme === themeOption.value}
                          onChange={(e) => setTheme(e.target.value as any)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">
                          {themeOption.emoji} {themeOption.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                          },
                        )
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Active subscriptions
                  </span>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total tracked</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Monthly spending
                  </span>
                  <span className="font-medium">$78.97</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
