import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";

// Layout components
import MainLayout from "@/components/layout/MainLayout";

// Pages
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Subscriptions from "@/pages/Subscriptions";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import Pricing from "@/pages/Pricing";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

// Loading component
import LoadingSpinner from "@/components/ui/loading-spinner";

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Auth Route Component (redirect to dashboard if already authenticated)
interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const { user, isLoading, isInitialized } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Auth Callback Component
const AuthCallback: React.FC = () => {
  const { checkSession, user, isLoading } = useAuthStore();
  const [isProcessing, setIsProcessing] = React.useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsProcessing(true);

        // Log current URL for debugging
        console.log("AuthCallback - Current URL:", window.location.href);

        // Let Supabase handle the session exchange first, then clean the URL.
        await checkSession();

        // Clean up OAuth params after session processing (prevents breaking PKCE exchange)
        if (window.location.hash || window.location.search) {
          window.history.replaceState(null, "", window.location.pathname);
        }

        setIsProcessing(false);
      } catch (error) {
        console.error("Auth callback error:", error);
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [checkSession]);

  // Redirect after successful authentication
  useEffect(() => {
    if (!isProcessing && !isLoading && user) {
      console.log("Auth callback successful, redirecting to dashboard");
      window.location.href = "/dashboard";
    } else if (!isProcessing && !isLoading && !user) {
      console.log("Auth callback failed, redirecting to login");
      window.location.href = "/login";
    }
  }, [isProcessing, isLoading, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Completing sign in...</p>
        {process.env.NODE_ENV !== "production" && (
          <div className="text-xs text-muted-foreground">
            <p>Processing: {isProcessing.toString()}</p>
            <p>Loading: {isLoading.toString()}</p>
            <p>User: {user ? "exists" : "null"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4 p-6">
            <div className="text-6xl">🚨</div>
            <h1 className="text-2xl font-bold text-destructive">
              Something went wrong
            </h1>
            <p className="text-muted-foreground max-w-md">
              An unexpected error occurred. Please refresh the page and try
              again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV !== "production" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs bg-muted p-4 rounded-md overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component
const App: React.FC = () => {
  const { initialize, isInitialized, user } = useAuthStore();
  const { setTheme, theme } = useUIStore();

  const location = useLocation();

  // Handle Google Analytics page views
  useEffect(() => {
    // @ts-ignore
    if (typeof window.gtag === 'function') {
      // @ts-ignore
      window.gtag('config', 'G-MWJ1N43M5G', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  // Handle OAuth redirects that might land on any page
  useEffect(() => {
    const handleOAuthRedirect = () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      if (accessToken) {
        console.log("OAuth redirect detected, redirecting to callback...");
        // Redirect to the proper callback route
        window.location.href = '/auth/callback' + window.location.hash;
      }
    };

    handleOAuthRedirect();
  }, []);

  // Initialize the app
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize auth
        if (!isInitialized) {
          await initialize();
        }

        // Apply saved theme or system preference
        if (theme) {
          setTheme(theme);
        }

        // Set up viewport height CSS custom property for mobile
        const setVH = () => {
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty("--vh", `${vh}px`);
        };

        setVH();
        window.addEventListener("resize", setVH);

        return () => window.removeEventListener("resize", setVH);
      } catch (error) {
        console.error("App initialization error:", error);
      }
    };

    initApp();
  }, [initialize, isInitialized, setTheme, theme]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRoute>
                <Signup />
              </AuthRoute>
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route
            path="/pricing"
            element={
              user ? (
                <MainLayout>
                  <Pricing />
                </MainLayout>
              ) : (
                <div className="min-h-screen relative pt-12 px-4 pb-12">
                  <Link
                    to="/"
                    className="fixed top-6 right-6 p-2 rounded-full bg-[#10121a] border border-white/10 text-muted-foreground hover:text-white hover:bg-white/5 transition-colors z-50 flex items-center justify-center"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </Link>
                  <Pricing />
                </div>
              )
            }
          />

          {/* Protected Routes with Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Subscriptions />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Analytics />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Public routes */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

export default App;
