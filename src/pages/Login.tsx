import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react";
import { trackEvent, ANALYTICS_EVENTS } from "@/utils/analytics";

import { useAuth } from "@/hooks/useAuth";
import { FEATURES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { signIn, signInWithGoogle, isLoading, error, clearError } = useAuth();

  // Get redirect location from navigation state
  const from = (location.state as any)?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Focus email field on mount
  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      trackEvent(ANALYTICS_EVENTS.LOGIN_CLICK, { method: 'email' });
      const result = await signIn(data.email, data.password);

      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    if (!FEATURES.googleAuth) return;

    try {
      setIsGoogleLoading(true);
      trackEvent(ANALYTICS_EVENTS.GOOGLE_AUTH_CLICK, { context: 'login' });
      const result = await signInWithGoogle();

      if (result.success) {
        // OAuth redirect will handle navigation
      }
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 py-8 relative" style={{ background: "var(--c-bg)" }}>
      <div className="w-full max-w-md space-y-6 relative z-10 block">
        {/* Header */}
        <Link
          to="/"
          className="fixed top-6 right-6 p-2 rounded-full bg-[#10121a] border border-white/10 text-muted-foreground hover:text-white hover:bg-white/5 transition-colors z-50 flex items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </Link>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Link to="/">
              <h1 className="text-3xl font-bold font-display hover:opacity-90 transition-opacity" style={{ letterSpacing: "-1px" }}>
                Before<span style={{ color: "var(--c-primary)" }}>Charge</span>
              </h1>
            </Link>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track and manage all your subscriptions in one place
          </p>
        </div>

        {/* Login Panel */}
        <div className="panel">
          <div className="panel-top flex-col items-center justify-center p-6 border-b border-white/5">
            <h2 className="text-xl sm:text-2xl font-bold">Welcome back</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Sign in to your account to continue
            </p>
          </div>

          <div className="p-6 space-y-4">
            {!isSupabaseConfigured && (
              <div className="p-3 rounded-md border border-red-500/30 bg-red-500/10">
                <p className="text-sm text-red-500">
                  Authentication is currently unavailable due to a configuration
                  issue. Please check your Supabase URL/key environment variables
                  and redeploy.
                </p>
              </div>
            )}

            {/* Google Sign In */}
            {FEATURES.googleAuth && (
              <Button
                variant="outline"
                className="w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 text-white font-medium"
                onClick={handleGoogleSignIn}
                disabled={
                  !isSupabaseConfigured ||
                  isGoogleLoading ||
                  isLoading ||
                  isSubmitting
                }
              >
                {isGoogleLoading ? (
                  <LoadingSpinner size="sm" className="mr-2 border-white" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4" />
                )}
                Continue with Google
              </Button>
            )}

            {/* Divider */}
            {FEATURES.googleAuth && (
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#10121a] px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-9 h-11 bg-black/50 border-white/10 focus-visible:ring-primary"
                    {...register("email")}
                    disabled={isLoading || isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-9 pr-9 h-11 bg-black/50 border-white/10 focus-visible:ring-primary"
                    {...register("password")}
                    disabled={isLoading || isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-1">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary text-black font-bold hover:bg-primary/90 mt-2"
                disabled={!isSupabaseConfigured || isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2 border-black" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </div>

          <div className="p-6 pt-0 text-center text-sm text-muted-foreground border-t border-white/5 mt-4 pt-4">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
