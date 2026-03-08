import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Session } from "@supabase/supabase-js";
import { auth, db, handleSupabaseError } from "@/lib/supabase";
import { UserProfile, NotificationPreferences } from "@/types/app.types";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "@/lib/constants";
import toast from "react-hot-toast";

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  signUp: (
    email: string,
    password: string,
    userData?: { full_name?: string },
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

// Helper function to ensure profile exists
const ensureProfileExists = async (user: User): Promise<UserProfile | null> => {
  try {
    console.log("ensureProfileExists called for user:", user.id);

    // First try to get existing profile
    const { data: existingProfile, error: fetchError } = await db.profiles.get(user.id);

    console.log("Profile fetch result:", { existingProfile, fetchError });

    if (existingProfile) {
      console.log("Profile found, returning existing profile");
      return {
        ...existingProfile,
        full_name: existingProfile.full_name || undefined,
        avatar_url: existingProfile.avatar_url || undefined,
        notification_preferences: existingProfile.notification_preferences as unknown as NotificationPreferences,
      } as UserProfile;
    }

    // If profile doesn't exist (404 or PGRST116 error), create it
    if (fetchError && (fetchError.code === 'PGRST116' || fetchError.message?.includes('0 rows'))) {
      console.log("Profile not found, creating new profile for user:", user.id);
      console.log("User metadata:", user.user_metadata);

      const newProfile: UserProfile = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined,
        default_currency: "USD",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notification_preferences: DEFAULT_NOTIFICATION_PREFERENCES,
        plan_type: "free",
        plan_expires_at: null,
        plan_provider: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Creating profile with data:", newProfile);

      const { data: createdProfile, error: createError } = await db.profiles.upsert({
        ...newProfile,
        notification_preferences: newProfile.notification_preferences as any,
      });

      console.log("Profile creation result:", { createdProfile, createError });

      if (createError) {
        console.error("Error creating profile:", createError);
        return null;
      }

      if (createdProfile) {
        console.log("Profile created successfully");
        return {
          ...createdProfile,
          full_name: createdProfile.full_name || undefined,
          avatar_url: createdProfile.avatar_url || undefined,
          notification_preferences: createdProfile.notification_preferences as unknown as NotificationPreferences,
        } as UserProfile;
      }
    }

    // Other errors
    console.error("Error fetching profile:", fetchError);
    return null;
  } catch (error) {
    console.error("Error in ensureProfileExists:", error);
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Sign up with email and password
      signUp: async (
        email: string,
        password: string,
        userData?: { full_name?: string },
      ) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await auth.signUp(email, password, userData);

          if (error) {
            throw error;
          }

          if (data.user && data.session) {
            // Create initial profile
            const profile: UserProfile = {
              id: data.user.id,
              email: data.user.email!,
              full_name: userData?.full_name || undefined,
              avatar_url: undefined,
              default_currency: "USD",
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              notification_preferences: DEFAULT_NOTIFICATION_PREFERENCES,
              plan_type: "free",
              plan_expires_at: null,
              plan_provider: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            const { error: profileError } = await db.profiles.upsert({
              ...profile,
              notification_preferences: profile.notification_preferences as any,
            });

            if (profileError) {
              console.error("Error creating profile:", profileError);
              // Don't throw here, as the user account was created successfully
            }

            set({
              user: data.user,
              session: data.session,
              profile,
              isLoading: false,
              error: null,
            });

            toast.success(
              "Account created successfully! Please check your email for verification.",
            );
          } else {
            toast.success(
              "Account created successfully! Please check your email for verification.",
            );
            set({ isLoading: false });
          }
        } catch (error: any) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Sign in with email and password
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await auth.signIn(email, password);

          if (error) {
            throw error;
          }

          if (data.user && data.session) {
            // Ensure profile exists
            const profile = await ensureProfileExists(data.user);

            set({
              user: data.user,
              session: data.session,
              profile,
              isLoading: false,
              error: null,
            });

            toast.success("Successfully signed in!");
          }
        } catch (error: any) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Sign in with Google
      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await auth.signInWithGoogle();

          if (error) {
            throw error;
          }

          // Note: The actual sign-in happens in the OAuth callback
          // The session will be set when the user returns from Google
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Sign out
      signOut: async () => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await auth.signOut();

          if (error) {
            throw error;
          }

          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            error: null,
          });

          toast.success("Successfully signed out!");
        } catch (error: any) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Reset password
      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await auth.resetPassword(email);

          if (error) {
            throw error;
          }

          set({ isLoading: false, error: null });
          toast.success("Password reset email sent! Check your inbox.");
        } catch (error: any) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Update password
      updatePassword: async (password: string) => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await auth.updatePassword(password);

          if (error) {
            throw error;
          }

          set({ isLoading: false, error: null });
          toast.success("Password updated successfully!");
        } catch (error: any) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Update user profile
      updateProfile: async (updates: Partial<UserProfile>) => {
        const { user, profile } = get();

        if (!user || !profile) {
          throw new Error("User not authenticated");
        }

        set({ isLoading: true, error: null });

        try {
          const updatedProfile = {
            ...updates,
            updated_at: new Date().toISOString(),
          };

          const { data, error } = await db.profiles.update(user.id, {
            ...updatedProfile,
            notification_preferences:
              updatedProfile.notification_preferences as any,
          });

          if (error) {
            throw error;
          }

          set({
            profile: data
              ? ({
                ...data,
                full_name: data.full_name || undefined,
                avatar_url: data.avatar_url || undefined,
                notification_preferences:
                  data.notification_preferences as unknown as NotificationPreferences,
              } as UserProfile)
              : null,
            isLoading: false,
            error: null,
          });

          toast.success("Profile updated successfully!");
        } catch (error: any) {
          const errorMessage = handleSupabaseError(error);
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Check current session
      checkSession: async () => {
        try {
          console.log("checkSession called");

          // First, try to get the current session
          let sessionResult = await auth.getCurrentSession();

          // If no session and we're on a callback page, wait a bit for Supabase to process
          if (!sessionResult.data.session && window.location.pathname === '/auth/callback') {
            console.log("No session on callback page, waiting for Supabase to process...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            sessionResult = await auth.getCurrentSession();
          }

          const { session } = sessionResult.data;
          const { error } = sessionResult;

          console.log("Session check result:", {
            session: !!session,
            error,
            userId: session?.user?.id,
            email: session?.user?.email
          });

          if (error) {
            throw error;
          }

          if (session?.user) {
            console.log("Session found, ensuring profile exists for user:", session.user.email);
            // Ensure profile exists
            const profile = await ensureProfileExists(session.user);

            console.log("Setting auth state with profile:", !!profile);
            set({
              user: session.user,
              session,
              profile,
            });
          } else {
            console.log("No session found, clearing auth state");
            set({
              user: null,
              session: null,
              profile: null,
            });
          }
        } catch (error: any) {
          console.error("Session check error:", error);
          set({
            user: null,
            session: null,
            profile: null,
            error: handleSupabaseError(error),
          });
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Initialize auth state
      initialize: async () => {
        if (get().isInitialized) return;

        set({ isLoading: true });

        try {
          // Check for existing session
          await get().checkSession();

          // Set up auth state change listener
          auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event, session);

            if (event === "SIGNED_IN" && session?.user) {
              // Ensure profile exists
              const profile = await ensureProfileExists(session.user);

              set({
                user: session.user,
                session,
                profile,
                isLoading: false,
                error: null,
              });
            } else if (event === "SIGNED_OUT") {
              set({
                user: null,
                session: null,
                profile: null,
                isLoading: false,
                error: null,
              });
            } else if (event === "TOKEN_REFRESHED" && session) {
              set({
                session,
                isLoading: false,
              });
            } else if (event === "USER_UPDATED" && session?.user) {
              set({
                user: session.user,
                session,
              });
            }
          });

          set({ isInitialized: true, isLoading: false });
        } catch (error: any) {
          console.error("Auth initialization error:", error);
          set({
            isInitialized: true,
            isLoading: false,
            error: handleSupabaseError(error),
          });
        }
      },
    }),
    {
      name: 'auth-storage', // Use proper auth storage key
      partialize: (state) => ({
        // Only persist user and session data, not loading states
        user: state.user,
        session: state.session,
        profile: state.profile,
      }),
      version: 1,
      migrate: (persistedState: any) => {
        // Handle migration if needed
        return persistedState;
      },
    },
  ),
);

// Selectors for easier access to specific state
export const useUser = () => useAuthStore((state) => state.user);
export const useSession = () => useAuthStore((state) => state.session);
export const useProfile = () => useAuthStore((state) => state.profile);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// Helper hooks
export const useAuthActions = () => {
  const store = useAuthStore();
  return {
    signUp: store.signUp,
    signIn: store.signIn,
    signInWithGoogle: store.signInWithGoogle,
    signOut: store.signOut,
    resetPassword: store.resetPassword,
    updatePassword: store.updatePassword,
    updateProfile: store.updateProfile,
    clearError: store.clearError,
  };
};

export default useAuthStore;
