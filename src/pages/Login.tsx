import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { FEATURES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-6 w-6 sm:h-8 sm:w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs sm:text-sm">
                S
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">
              <span className="hidden sm:inline">MyRenewly</span>
              <span className="sm:hidden">MyRenewly</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track and manage all your subscriptions in one place
          </p>
        </div>

        {/* Login Card */}
        <Card className="mobile-card-compact">
          <CardHeader className="mobile-card-header">
            <CardTitle className="text-xl sm:text-2xl">Welcome back</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="mobile-card-content space-y-4">
            {!isSupabaseConfigured && (
              <div className="p-3 rounded-md border border-destructive/30 bg-destructive/10">
                <p className="text-sm text-destructive">
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
                className="mobile-button-full w-full h-11 sm:h-10"
                onClick={handleGoogleSignIn}
                disabled={
                  !isSupabaseConfigured ||
                  isGoogleLoading ||
                  isLoading ||
                  isSubmitting
                }
              >
                {isGoogleLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4" />
                )}
                Continue with Google
              </Button>
            )}

            {/* Divider */}
            {FEATURES.googleAuth && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-9 mobile-input h-11 sm:h-10"
                    {...register("email")}
                    disabled={isLoading || isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-9 pr-9 mobile-input h-11 sm:h-10"
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
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="mobile-button-full w-full h-11 sm:h-10"
                disabled={!isSupabaseConfigured || isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
