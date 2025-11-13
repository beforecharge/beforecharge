import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { UserProfile, NotificationPreferences } from "@/types/app.types";

/**
 * Custom hook for authentication functionality
 * Provides auth state and actions with convenient interface
 */
export const useAuth = () => {
  const {
    user,
    session,
    profile,
    isLoading,
    isInitialized,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    checkSession,
    clearError,
    initialize,
  } = useAuthStore();

  // Derived state
  const isAuthenticated = !!user;
  const isGuest = !user && isInitialized;
  const userId = user?.id || null;
  const userEmail = user?.email || null;

  // Initialize auth on first use
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Auth actions with error handling
  const handleSignUp = useCallback(
    async (
      email: string,
      password: string,
      userData?: { full_name?: string },
    ) => {
      try {
        clearError();
        await signUp(email, password, userData);
        return { success: true, error: null };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [signUp, clearError],
  );

  const handleSignIn = useCallback(
    async (email: string, password: string) => {
      try {
        clearError();
        await signIn(email, password);
        return { success: true, error: null };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [signIn, clearError],
  );

  const handleSignInWithGoogle = useCallback(async () => {
    try {
      clearError();
      await signInWithGoogle();
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [signInWithGoogle, clearError]);

  const handleSignOut = useCallback(async () => {
    try {
      clearError();
      await signOut();
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [signOut, clearError]);

  const handleResetPassword = useCallback(
    async (email: string) => {
      try {
        clearError();
        await resetPassword(email);
        return { success: true, error: null };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [resetPassword, clearError],
  );

  const handleUpdatePassword = useCallback(
    async (password: string) => {
      try {
        clearError();
        await updatePassword(password);
        return { success: true, error: null };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [updatePassword, clearError],
  );

  const handleUpdateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      try {
        clearError();
        await updateProfile(updates);
        return { success: true, error: null };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [updateProfile, clearError],
  );

  const refreshSession = useCallback(async () => {
    try {
      await checkSession();
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [checkSession]);

  // Helper functions
  const hasRole = useCallback(
    (_role: string): boolean => {
      // Add role checking logic if you implement roles
      return true;
    },
    [user],
  );

  const hasPermission = useCallback(
    (_permission: string): boolean => {
      // Add permission checking logic if you implement permissions
      return isAuthenticated;
    },
    [isAuthenticated],
  );

  const getInitials = useCallback((): string => {
    if (!profile?.full_name) {
      return userEmail?.charAt(0).toUpperCase() || "U";
    }

    const names = profile.full_name.split(" ");
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  }, [profile?.full_name, userEmail]);

  const getDisplayName = useCallback((): string => {
    return profile?.full_name || userEmail?.split("@")[0] || "User";
  }, [profile?.full_name, userEmail]);

  const isProfileComplete = useCallback((): boolean => {
    return !!(profile?.full_name && profile?.default_currency);
  }, [profile]);

  const updateNotificationPreferences = useCallback(
    async (preferences: Partial<NotificationPreferences>) => {
      if (!profile) return { success: false, error: "No profile found" };

      return handleUpdateProfile({
        notification_preferences: {
          ...profile.notification_preferences,
          ...preferences,
        },
      });
    },
    [profile, handleUpdateProfile],
  );

  // Return auth interface
  return {
    // State
    user,
    session,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated,
    isGuest,
    userId,
    userEmail,
    error,

    // Actions
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,
    updateProfile: handleUpdateProfile,
    updateNotificationPreferences,
    refreshSession,
    clearError,

    // Helpers
    hasRole,
    hasPermission,
    getInitials,
    getDisplayName,
    isProfileComplete,
  };
};

/**
 * Hook to require authentication
 * Throws error if user is not authenticated
 */
export const useRequireAuth = () => {
  const { isAuthenticated, isInitialized, user } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      throw new Error("Authentication required");
    }
  }, [isAuthenticated, isInitialized]);

  return { user };
};

/**
 * Hook to redirect unauthenticated users
 */
export const useAuthRedirect = (redirectTo: string = "/login") => {
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isInitialized, redirectTo]);
};

/**
 * Hook for auth state with loading handling
 */
export const useAuthWithLoading = () => {
  const auth = useAuth();

  return {
    ...auth,
    isReady: auth.isInitialized && !auth.isLoading,
    canProceed: auth.isInitialized && !auth.isLoading && auth.isAuthenticated,
  };
};

export default useAuth;
