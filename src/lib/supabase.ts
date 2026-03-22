import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { SUPABASE_CONFIG } from './constants';

const isValidSupabaseUrl = (url: string | undefined) =>
  !!url && /^https?:\/\//.test(url);

export const isSupabaseConfigured =
  isValidSupabaseUrl(SUPABASE_CONFIG.url) && !!SUPABASE_CONFIG.anonKey;

if (!isSupabaseConfigured) {
  // Don't crash the whole app (we want the marketing pages to render),
  // but do surface an actionable error in the console.
  // Common cause: wrong/missing `VITE_SUPABASE_URL` or missing `https://`.
  console.error(
    "[BeforeCharge] Supabase is not configured correctly. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    {
      url: SUPABASE_CONFIG.url,
      hasAnonKey: !!SUPABASE_CONFIG.anonKey,
    },
  );
}

// Initialize Supabase client
export const supabase: SupabaseClient<Database> = createClient(
  SUPABASE_CONFIG.url || "http://localhost:54321",
  SUPABASE_CONFIG.anonKey || "invalid-anon-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // Force PKCE flow instead of implicit
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token',
    },
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  }
);

// Type definitions for tables
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Auth utilities
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData?: { full_name?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    // Redirect to home page - Supabase will detect the OAuth code automatically
    const redirectUrl = `${window.location.origin}/`;
    
    console.log('OAuth redirect URL:', redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
        skipBrowserRedirect: false,
      },
    });

    console.log('OAuth initiation result:', { data, error });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  },

  // Update password
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  // Get current session
  getCurrentSession: () => {
    return supabase.auth.getSession();
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database utilities
export const db = {
  // Subscriptions
  subscriptions: {
    // Get all subscriptions for a user
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          categories (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    },

    // Get subscription by ID
    getById: async (id: string, userId: string) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          categories (
            id,
            name,
            icon,
            color
          ),
          receipts (
            id,
            file_name,
            file_url,
            file_size,
            mime_type
          )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      return { data, error };
    },

    // Create subscription
    create: async (subscription: Database['public']['Tables']['subscriptions']['Insert']) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscription)
        .select()
        .single();

      return { data, error };
    },

    // Update subscription
    update: async (id: string, updates: Database['public']['Tables']['subscriptions']['Update']) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    },

    // Delete subscription
    delete: async (id: string, userId: string) => {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return { error };
    },

    // Get upcoming renewals
    getUpcomingRenewals: async (userId: string, daysAhead: number = 30) => {
      const { data, error } = await supabase.rpc('get_upcoming_renewals', {
        user_id: userId,
        days_ahead: daysAhead,
      });

      return { data, error };
    },
  },

  // Categories
  categories: {
    // Get all categories for a user (including default ones)
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},is_default.eq.true`)
        .order('name');

      return { data, error };
    },

    // Create category
    create: async (category: Database['public']['Tables']['categories']['Insert']) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      return { data, error };
    },

    // Update category
    update: async (id: string, updates: Database['public']['Tables']['categories']['Update']) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    },

    // Delete category
    delete: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      return { error };
    },
  },

  // Tags
  tags: {
    // Get all tags for a user
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      return { data, error };
    },

    // Create tag
    create: async (tag: Database['public']['Tables']['tags']['Insert']) => {
      const { data, error } = await supabase
        .from('tags')
        .insert(tag)
        .select()
        .single();

      return { data, error };
    },

    // Delete tag
    delete: async (id: string) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      return { error };
    },
  },

  // Profiles
  profiles: {
    // Get user profile
    get: async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    },

    // Create or update profile
    upsert: async (profile: Database['public']['Tables']['profiles']['Insert']) => {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profile)
        .select()
        .single();

      return { data, error };
    },

    // Update profile
    update: async (userId: string, updates: Database['public']['Tables']['profiles']['Update']) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    },
  },

  // Analytics
  analytics: {
    // Get monthly spending
    getMonthlySpending: async (userId: string, startDate: string, endDate: string) => {
      const { data, error } = await supabase.rpc('get_monthly_spending', {
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
      });

      return { data, error };
    },

    // Get category spending
    getCategorySpending: async (userId: string) => {
      const { data, error } = await supabase.rpc('get_category_spending', {
        user_id: userId,
      });

      return { data, error };
    },

    // Get unused subscriptions
    getUnusedSubscriptions: async (userId: string, daysUnused: number = 30) => {
      const { data, error } = await supabase.rpc('get_unused_subscriptions', {
        user_id: userId,
        days_unused: daysUnused,
      });

      return { data, error };
    },

    // Calculate annual savings
    calculateAnnualSavings: async (userId: string) => {
      const { data, error } = await supabase.rpc('calculate_annual_savings', {
        user_id: userId,
      });

      return { data, error };
    },
  },

  // Notifications
  notifications: {
    // Get all notifications for a user
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    },

    // Mark notification as read
    markAsRead: async (id: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    },

    // Mark all notifications as read
    markAllAsRead: async (userId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      return { data, error };
    },

    // Delete notification
    delete: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      return { error };
    },
  },

  // Receipts
  receipts: {
    // Get all receipts for a subscription
    getBySubscription: async (subscriptionId: string) => {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });

      return { data, error };
    },

    // Create receipt record
    create: async (receipt: Database['public']['Tables']['receipts']['Insert']) => {
      const { data, error } = await supabase
        .from('receipts')
        .insert(receipt)
        .select()
        .single();

      return { data, error };
    },

    // Delete receipt
    delete: async (id: string) => {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id);

      return { error };
    },
  },
};

// Storage utilities
export const storage = {
  // Upload file to receipts bucket
  uploadReceipt: async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from(SUPABASE_CONFIG.storageBucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    return { data, error };
  },

  // Get public URL for a file
  getPublicUrl: (path: string) => {
    const { data } = supabase.storage
      .from(SUPABASE_CONFIG.storageBucket)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  // Delete file
  deleteFile: async (path: string) => {
    const { data, error } = await supabase.storage
      .from(SUPABASE_CONFIG.storageBucket)
      .remove([path]);

    return { data, error };
  },

  // List files in a folder
  listFiles: async (folder: string = '') => {
    const { data, error } = await supabase.storage
      .from(SUPABASE_CONFIG.storageBucket)
      .list(folder);

    return { data, error };
  },
};

// Real-time subscriptions
export const realtime = {
  // Subscribe to table changes
  subscribeToTable: (
    table: keyof Database['public']['Tables'],
    callback: (payload: any) => void,
    filter?: string
  ) => {
    const subscription = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        callback
      )
      .subscribe();

    return subscription;
  },

  // Subscribe to user-specific changes
  subscribeToUserData: (userId: string, callback: (payload: any) => void) => {
    const subscription = supabase
      .channel(`user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};

// Error handling utility
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);

  const errorMappings: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'User already registered': 'An account with this email already exists',
    'Email not confirmed': 'Please check your email and confirm your account',
    'Password should be at least 6 characters': 'Password must be at least 6 characters long',
    'Unable to validate email address': 'Please enter a valid email address',
    'email rate limit exceeded': 'Rate limit hit! To continue testing immediately, please go to your Supabase Dashboard > Authentication > Providers > Email, and turn OFF "Confirm email".',
  };

  if (error?.message && errorMappings[error.message]) {
    return errorMappings[error.message];
  }

  // Rate limit specifics
  if (error?.message?.includes('rate limit')) {
    return 'Rate limit hit! To continue testing immediately, please go to your Supabase Dashboard > Authentication > Providers > Email, and turn OFF "Confirm email".';
  }

  // Network errors
  if (error?.message?.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Generic fallback
  return error?.message || 'An unexpected error occurred. Please try again.';
};

// Type guards
export const isAuthError = (error: any): error is { message: string; status: number } => {
  return error && typeof error.message === 'string' && typeof error.status === 'number';
};

export const isSupabaseError = (error: any): error is { message: string; details: string; hint: string; code: string } => {
  return error && typeof error.message === 'string' && 'code' in error;
};

// Helper to check if user is authenticated
export const checkAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Helper to ensure user is authenticated
export const requireAuth = async () => {
  const { session, error } = await checkAuth();
  if (error || !session) {
    throw new Error('Authentication required');
  }
  return session;
};

export default supabase;
