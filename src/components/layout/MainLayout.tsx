import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  Calendar,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, signOut, getInitials } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  const currentNavItem = navigation.find(n => n.href === location.pathname);
  const title = currentNavItem ? currentNavItem.name : (location.pathname === "/settings" ? "Settings" : "BeforeCharge");
  const subtitle = location.pathname === "/dashboard" ? "Good morning! ☀️" : (location.pathname === "/settings" ? "Manage your account" : "Overview");

  return (
    <div className="app">
      <nav className="sb hidden md:flex">
        <div className="sb-inner">
          <div className="sb-brand">
            <div className="sbm">B</div>
            <div className="sb-name">Before<b>Charge</b></div>
          </div>

          <div className="sb-user">
            <div className="av">{getInitials()}</div>
            <div>
              <div className="av-name">{user?.user_metadata?.first_name || "User"}</div>
              <div className="av-plan">Personal Plan</div>
            </div>
            <div className="av-chevron">▾</div>
          </div>

          <div className="sb-section">
            <div className="sb-section-label">Menu</div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.name} to={item.href} className={`ni ${isActive ? "on" : ""}`}>
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="sb-section">
            <div className="sb-section-label">Account</div>
            <Link to="/settings" className={`ni ${location.pathname === "/settings" ? "on" : ""}`}>
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>

        <div className="sb-bottom">
          <div className="upgrade-card">
            <div className="uc-eyebrow">✦ Upgrade available</div>
            <div className="uc-title">Business Plan</div>
            <div className="uc-sub">Team tracking, waste reports & CSV export</div>
            <button className="uc-btn">Upgrade — $24/mo →</button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="main">
        <div className="topbar">
          <div className="tb-l">
            <span className="tb-eye">{subtitle}</span>
            <span className="tb-title">{title}</span>
          </div>
          <div className="tb-r cursor-pointer">
            <button className="icon-btn">
              <Bell className="h-4 w-4" />
              <div className="n-pip"></div>
            </button>
            <div className="av" onClick={handleSignOut} title="Sign Out">{getInitials()}</div>
          </div>
        </div>

        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
