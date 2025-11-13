import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Settings,
  DollarSign,
  Menu,
  LogOut,
  Bell,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Pricing", href: "/pricing", icon: DollarSign },
  { name: "Settings", href: "/settings", icon: Settings },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, signOut, getDisplayName, getInitials } = useAuth();
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useUIStore();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">
                  S
                </span>
              </div>
              <span className="hidden font-bold sm:inline-block">
                Subscription Manager
              </span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Search could go here */}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title="Toggle theme"
              >
                {theme === "dark" ? "🌙" : "🌞"}
              </Button>

              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-foreground">
                    {getInitials()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{getDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? "w-16" : "w-64"
          } hidden border-r bg-background md:block transition-all duration-200`}
        >
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {!sidebarCollapsed && (
                        <span className="ml-3">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {!sidebarCollapsed && (
          <div
            className="fixed inset-0 z-50 md:hidden bg-background/80 backdrop-blur-sm"
            onClick={toggleSidebar}
          >
            <aside className="fixed left-0 top-0 z-50 h-full w-64 border-r bg-background">
              <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                  <div className="space-y-1">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;

                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={toggleSidebar}
                          className={`flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground ${
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="ml-3">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
