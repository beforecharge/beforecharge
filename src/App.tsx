import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
    return <Navigate to="/" replace />;
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
        
        // Check if we have auth tokens in the URL hash (implicit flow fallback)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        // Check if we have auth code in URL params (PKCE flow)
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        
        if (accessToken) {
          console.log("Found access token in URL hash (implicit flow), processing...");
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
        } else if (authCode) {
          console.log("Found auth code in URL params (PKCE flow), processing...");
          // Clear the search params from URL
          window.history.replaceState(null, '', window.location.pathname);
        } else {
          console.log("No auth tokens found in URL, checking existing session...");
        }
        
        // Let Supabase handle the session
        await checkSession();

        // Add a delay to ensure state is updated
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000); // Increased delay for better reliability
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
        {process.env.NODE_ENV === "development" && (
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
            {process.env.NODE_ENV === "development" && this.state.error && (
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
  const { initialize, isInitialized } = useAuthStore();
  const { setTheme, theme } = useUIStore();

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

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <h2 className="text-xl font-semibold">MyRenewly</h2>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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
              <MainLayout>
                <Pricing />
              </MainLayout>
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

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

export default App;
