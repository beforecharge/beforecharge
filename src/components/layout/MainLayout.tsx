import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  Calendar,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

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
  const navigate = useNavigate();
  const { user, signOut, getInitials } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsMobileMenuOpen(false);
      await signOut();
      // Force navigation to home page after sign out
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      // Still close menu and redirect even if there's an error
      window.location.href = "/";
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const currentNavItem = navigation.find(n => n.href === location.pathname);
  const title = currentNavItem ? currentNavItem.name : (location.pathname === "/settings" ? "Settings" : "BeforeCharge");
  const subtitle = location.pathname === "/dashboard" ? "Good morning! ☀️" : (location.pathname === "/settings" ? "Manage your account" : "Overview");

  return (
    <div className="app">
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* Sidebar */}
      <nav className={`sb ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sb-inner">
          <div className="sb-brand">
            <div className="sbm">B</div>
            <div className="sb-name">Before<b>Charge</b></div>
            <button 
              className="ml-auto md:hidden icon-btn"
              onClick={closeMobileMenu}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="sb-user">
                <div className="av">{getInitials()}</div>
                <div>
                  <div className="av-name">
                    {user?.user_metadata?.first_name || "User"}
                  </div>
                  <div className="av-plan">Personal Plan</div>
                </div>
                <div className="av-chevron">▾</div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" side="bottom">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { navigate("/settings"); closeMobileMenu(); }}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  handleSignOut();
                }} 
                className="text-red-500 focus:text-red-500 cursor-pointer"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="sb-section">
            <div className="sb-section-label">Menu</div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  to={item.href} 
                  className={`ni ${isActive ? "on" : ""}`}
                  onClick={closeMobileMenu}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="sb-section">
            <div className="sb-section-label">Account</div>
            <Link 
              to="/settings" 
              className={`ni ${location.pathname === "/settings" ? "on" : ""}`}
              onClick={closeMobileMenu}
            >
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
            <button
              className="uc-btn"
              onClick={() => { navigate("/pricing"); closeMobileMenu(); }}
            >
              Upgrade — $24/mo →
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="main">
        <div className="topbar">
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="tb-l">
            <span className="tb-eye">{subtitle}</span>
            <span className="tb-title">{title}</span>
          </div>
          <div className="tb-r cursor-pointer">
            <button
              className="icon-btn"
              onClick={() => toast.success("You're all caught up! No new notifications.")}
            >
              <Bell className="h-4 w-4" />
              <div className="n-pip"></div>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="av" title="Account">{getInitials()}</div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
