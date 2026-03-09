import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Chrome } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { FEATURES } from '@/lib/constants';
import { isSupabaseConfigured } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import LoadingSpinner from '@/components/ui/loading-spinner';

// Form validation schema
const signupSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
  confirm_password: z
    .string()
    .min(1, 'Please confirm your password'),
  terms: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const { signUp, signInWithGoogle, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
      terms: false,
    },
  });

  // Focus full name field on mount
  useEffect(() => {
    setFocus('full_name');
  }, [setFocus]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle form submission
  const onSubmit = async (data: SignupFormData) => {
    try {
      const result = await signUp(data.email, data.password, {
        full_name: data.full_name,
      });

      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  // Handle Google sign up
  const handleGoogleSignUp = async () => {
    if (!FEATURES.googleAuth) return;

    try {
      setIsGoogleLoading(true);
      const result = await signInWithGoogle();

      if (result.success) {
        // OAuth redirect will handle navigation
      }
    } catch (error) {
      console.error('Google sign up error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 py-8 relative" style={{ background: "var(--c-bg)" }}>
      <div className="w-full max-w-md space-y-6 relative z-10 block">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-3xl font-bold font-display" style={{ letterSpacing: "-1px" }}>
              Before<span style={{ color: "var(--c-primary)" }}>Charge</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Start tracking your subscriptions today
          </p>
        </div>

        {/* Signup Panel */}
        <div className="panel">
          <div className="panel-top flex-col items-center justify-center p-6 border-b border-white/5">
            <h2 className="text-xl sm:text-2xl font-bold">Create your account</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Join thousands of users managing their subscriptions
            </p>
          </div>

          <div className="p-6 space-y-4">
            {!isSupabaseConfigured && (
              <div className="p-3 rounded-md border border-red-500/30 bg-red-500/10">
                <p className="text-sm text-red-500">
                  Sign up is currently unavailable due to a configuration issue.
                  Please check your Supabase URL/key environment variables and
                  redeploy.
                </p>
              </div>
            )}

            {/* Google Sign Up */}
            {FEATURES.googleAuth && (
              <Button
                variant="outline"
                className="w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 text-white font-medium"
                onClick={handleGoogleSignUp}
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
                    Or continue with email
                  </span>
                </div>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-9 h-11 bg-black/50 border-white/10 focus-visible:ring-primary"
                    {...register('full_name')}
                    disabled={!isSupabaseConfigured || isLoading || isSubmitting}
                  />
                </div>
                {errors.full_name && (
                  <p className="text-sm text-red-500">{errors.full_name.message}</p>
                )}
              </div>

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
                    {...register('email')}
                    disabled={!isSupabaseConfigured || isLoading || isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="pl-9 pr-9 h-11 bg-black/50 border-white/10 focus-visible:ring-primary"
                    {...register('password')}
                    disabled={!isSupabaseConfigured || isLoading || isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={!isSupabaseConfigured || isLoading || isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="pl-9 pr-9 h-11 bg-black/50 border-white/10 focus-visible:ring-primary"
                    {...register('confirm_password')}
                    disabled={!isSupabaseConfigured || isLoading || isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={!isSupabaseConfigured || isLoading || isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2 pt-2">
                <input
                  id="terms"
                  type="checkbox"
                  {...register('terms')}
                  disabled={isLoading || isSubmitting}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary bg-black/50"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium text-muted-foreground leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.terms && (
                    <p className="text-sm text-red-500">{errors.terms.message}</p>
                  )}
                </div>
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
                className="w-full h-11 bg-primary text-black font-bold hover:bg-primary/90 mt-4"
                disabled={!isSupabaseConfigured || isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2 border-black" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </div>

          <div className="p-6 pt-0 text-center text-sm text-muted-foreground border-t border-white/5 mt-4 pt-4">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="panel border-dashed p-4 bg-transparent border-white/10">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">Your data is secure</span>
            </div>
            <p className="text-xs text-muted-foreground">
              We use industry-standard encryption to protect your information.
              Your subscription data is never shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
