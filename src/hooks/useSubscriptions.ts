import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { db } from '@/lib/supabase';
import { Subscription, Category, SubscriptionFormData } from '@/types/app.types';
import { Database } from '@/types/database.types';
import { cleanupDuplicateSubscriptions } from '@/utils/cleanupDuplicates';
import { convertCurrency } from '@/utils/currencyUtils';
import { DEFAULTS } from '@/lib/constants';
import toast from 'react-hot-toast';

// Dummy data for new users
const DUMMY_SUBSCRIPTIONS = [
  {
    name: 'Netflix',
    description: 'Streaming service for movies and TV shows',
    cost: 15.99,
    currency: 'USD' as const,
    billing_cycle: 'monthly' as const,
    renewal_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
    website_url: 'https://netflix.com',
    notes: 'Family plan shared with roommates',
    tags: ['Personal', 'Entertainment']
  },
  {
    name: 'Spotify Premium',
    description: 'Music streaming service',
    cost: 9.99,
    currency: 'USD' as const,
    billing_cycle: 'monthly' as const,
    renewal_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days from now
    website_url: 'https://spotify.com',
    notes: 'Individual plan for music streaming',
    tags: ['Personal']
  },
  {
    name: 'GitHub Pro',
    description: 'Code repository hosting with advanced features',
    cost: 4.00,
    currency: 'USD' as const,
    billing_cycle: 'monthly' as const,
    renewal_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 25 days from now
    website_url: 'https://github.com',
    notes: 'For private repositories and advanced features',
    tags: ['Work', 'Essential']
  }
];

interface UseSubscriptionsReturn {
  subscriptions: Subscription[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // CRUD operations
  addSubscription: (data: SubscriptionFormData) => Promise<Subscription | null>;
  updateSubscription: (id: string, data: Partial<SubscriptionFormData>) => Promise<Subscription | null>;
  deleteSubscription: (id: string) => Promise<boolean>;
  toggleSubscriptionStatus: (id: string, isActive: boolean) => Promise<boolean>;

  // Utility functions
  getSubscriptionById: (id: string) => Subscription | undefined;
  getActiveSubscriptions: () => Subscription[];
  getInactiveSubscriptions: () => Subscription[];
  getUpcomingRenewals: (days?: number) => Subscription[];
  getTotalMonthlyCost: () => number;
  getTotalAnnualCost: () => number;

  // Data management
  refreshSubscriptions: () => Promise<void>;
  createDummyData: () => Promise<void>;
  cleanupDuplicates: () => Promise<void>;
  clearError: () => void;
}

export const useSubscriptions = (): UseSubscriptionsReturn => {
  const { user, isAuthenticated, profile } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoaded, setIsCategoriesLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to convert billing cycle to monthly cost
  const convertToMonthlyCost = (cost: number, billingCycle: string): number => {
    const multipliers = {
      'daily': 30.44, // Average days per month
      'weekly': 4.33, // Average weeks per month
      'monthly': 1,
      'quarterly': 1 / 3,
      'semi-annual': 1 / 6,
      'annual': 1 / 12
    };
    return cost * (multipliers[billingCycle as keyof typeof multipliers] || 1);
  };

  // Helper function to get category by name
  const getCategoryByName = useCallback((name: string): Category | undefined => {
    return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
  }, [categories]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await db.categories.getAll(user.id);
      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(`Failed to load categories: ${err.message}`);
    } finally {
      setIsCategoriesLoaded(true);
    }
  }, [user]);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await db.subscriptions.getAll(user.id);
      if (error) throw error;

      // Transform the data to match our Subscription interface
      const transformedData: Subscription[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        name: item.name,
        description: item.description || undefined,
        cost: parseFloat(item.cost.toString()),
        currency: item.currency as any,
        billing_cycle: item.billing_cycle as any,
        renewal_date: item.renewal_date,
        category_id: item.category_id,
        tags: item.tags || [],
        receipt_url: item.receipt_url || undefined,
        is_active: item.is_active,
        last_used_date: item.last_used_date || undefined,
        trial_end_date: item.trial_end_date || undefined,
        website_url: item.website_url || undefined,
        notes: item.notes || undefined,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setSubscriptions(transformedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching subscriptions:', err);
      setError(`Failed to load subscriptions: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create dummy data for new users
  const createDummyData = useCallback(async () => {
    if (!user || !isAuthenticated) return;

    try {
      // Double-check if user already has subscriptions
      const { data: existingSubscriptions, error: checkError } = await db.subscriptions.getAll(user.id);
      if (checkError) {
        console.error('Error checking existing subscriptions:', checkError);
        return;
      }

      if (existingSubscriptions && existingSubscriptions.length > 0) {
        return;
      }

      const streamingCategory = getCategoryByName('Streaming');
      const musicCategory = getCategoryByName('Music');
      const softwareCategory = getCategoryByName('Software');

      if (!streamingCategory || !musicCategory || !softwareCategory) {
        console.warn('Required categories not found for dummy data');
        return;
      }

      const dummyPromises = DUMMY_SUBSCRIPTIONS.map(async (dummy, index) => {
        let categoryId = streamingCategory.id;

        if (index === 1) categoryId = musicCategory.id; // Spotify
        if (index === 2) categoryId = softwareCategory.id; // GitHub

        const subscriptionData: Database['public']['Tables']['subscriptions']['Insert'] = {
          user_id: user.id,
          name: dummy.name,
          description: dummy.description,
          cost: dummy.cost,
          currency: dummy.currency,
          billing_cycle: dummy.billing_cycle,
          renewal_date: dummy.renewal_date,
          category_id: categoryId,
          tags: dummy.tags,
          website_url: dummy.website_url,
          notes: dummy.notes,
          is_active: true
        };

        const { data, error } = await db.subscriptions.create(subscriptionData);
        if (error) {
          console.error(`Error creating dummy subscription ${dummy.name}:`, error);
          return null;
        }
        return data;
      });

      const results = await Promise.all(dummyPromises);
      const successCount = results.filter(result => result !== null).length;

      if (successCount > 0) {
        toast.success(`Created ${successCount} sample subscriptions to get you started!`);
        await fetchSubscriptions(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Error creating dummy data:', err);
    }
  }, [user, isAuthenticated, categories, getCategoryByName, fetchSubscriptions]);

  // Add new subscription
  const addSubscription = useCallback(async (data: SubscriptionFormData): Promise<Subscription | null> => {
    if (!user) {
      toast.error('You must be logged in to add subscriptions');
      return null;
    }

    try {
      const subscriptionData: Database['public']['Tables']['subscriptions']['Insert'] = {
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        cost: parseFloat(data.cost),
        currency: data.currency,
        billing_cycle: data.billing_cycle,
        renewal_date: data.renewal_date,
        category_id: data.category_id,
        tags: data.tags || [],
        website_url: data.website_url || null,
        notes: data.notes || null,
        trial_end_date: data.trial_end_date || null,
        is_active: true
      };

      const { data: newSubscription, error } = await db.subscriptions.create(subscriptionData);
      if (error) throw error;

      if (newSubscription) {
        const transformedSubscription: Subscription = {
          id: newSubscription.id,
          user_id: newSubscription.user_id,
          name: newSubscription.name,
          description: newSubscription.description || undefined,
          cost: parseFloat(newSubscription.cost.toString()),
          currency: newSubscription.currency as any,
          billing_cycle: newSubscription.billing_cycle as any,
          renewal_date: newSubscription.renewal_date,
          category_id: newSubscription.category_id,
          tags: newSubscription.tags || [],
          receipt_url: newSubscription.receipt_url || undefined,
          is_active: newSubscription.is_active,
          last_used_date: newSubscription.last_used_date || undefined,
          trial_end_date: newSubscription.trial_end_date || undefined,
          website_url: newSubscription.website_url || undefined,
          notes: newSubscription.notes || undefined,
          created_at: newSubscription.created_at,
          updated_at: newSubscription.updated_at
        };

        setSubscriptions(prev => [transformedSubscription, ...prev]);
        toast.success(`${data.name} subscription added successfully!`);
        return transformedSubscription;
      }

      return null;
    } catch (err: any) {
      console.error('Error adding subscription:', err);
      toast.error(`Failed to add subscription: ${err.message}`);
      return null;
    }
  }, [user]);

  // Update subscription
  const updateSubscription = useCallback(async (id: string, data: Partial<SubscriptionFormData>): Promise<Subscription | null> => {
    if (!user) {
      toast.error('You must be logged in to update subscriptions');
      return null;
    }

    try {
      const updateData: Database['public']['Tables']['subscriptions']['Update'] = {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.cost && { cost: parseFloat(data.cost) }),
        ...(data.currency && { currency: data.currency }),
        ...(data.billing_cycle && { billing_cycle: data.billing_cycle }),
        ...(data.renewal_date && { renewal_date: data.renewal_date }),
        ...(data.category_id && { category_id: data.category_id }),
        ...(data.tags && { tags: data.tags }),
        ...(data.website_url !== undefined && { website_url: data.website_url || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.trial_end_date !== undefined && { trial_end_date: data.trial_end_date || null })
      };

      const { data: updatedSubscription, error } = await db.subscriptions.update(id, updateData);
      if (error) throw error;

      if (updatedSubscription) {
        const transformedSubscription: Subscription = {
          id: updatedSubscription.id,
          user_id: updatedSubscription.user_id,
          name: updatedSubscription.name,
          description: updatedSubscription.description || undefined,
          cost: parseFloat(updatedSubscription.cost.toString()),
          currency: updatedSubscription.currency as any,
          billing_cycle: updatedSubscription.billing_cycle as any,
          renewal_date: updatedSubscription.renewal_date,
          category_id: updatedSubscription.category_id,
          tags: updatedSubscription.tags || [],
          receipt_url: updatedSubscription.receipt_url || undefined,
          is_active: updatedSubscription.is_active,
          last_used_date: updatedSubscription.last_used_date || undefined,
          trial_end_date: updatedSubscription.trial_end_date || undefined,
          website_url: updatedSubscription.website_url || undefined,
          notes: updatedSubscription.notes || undefined,
          created_at: updatedSubscription.created_at,
          updated_at: updatedSubscription.updated_at
        };

        setSubscriptions(prev => prev.map(sub => sub.id === id ? transformedSubscription : sub));
        toast.success('Subscription updated successfully!');
        return transformedSubscription;
      }

      return null;
    } catch (err: any) {
      console.error('Error updating subscription:', err);
      toast.error(`Failed to update subscription: ${err.message}`);
      return null;
    }
  }, [user]);

  // Delete subscription
  const deleteSubscription = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to delete subscriptions');
      return false;
    }

    try {
      const { error } = await db.subscriptions.delete(id, user.id);
      if (error) throw error;

      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      toast.success('Subscription deleted successfully!');
      return true;
    } catch (err: any) {
      console.error('Error deleting subscription:', err);
      toast.error(`Failed to delete subscription: ${err.message}`);
      return false;
    }
  }, [user]);

  // Toggle subscription status
  const toggleSubscriptionStatus = useCallback(async (id: string, isActive: boolean): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to update subscriptions');
      return false;
    }

    try {
      const { data: updatedSubscription, error } = await db.subscriptions.update(id, { is_active: isActive });
      if (error) throw error;

      if (updatedSubscription) {
        setSubscriptions(prev => prev.map(sub =>
          sub.id === id ? { ...sub, is_active: isActive } : sub
        ));
        toast.success(`Subscription ${isActive ? 'activated' : 'deactivated'} successfully!`);
        return true;
      }

      return false;
    } catch (err: any) {
      console.error('Error toggling subscription status:', err);
      toast.error(`Failed to update subscription: ${err.message}`);
      return false;
    }
  }, [user]);

  // Utility functions
  const getSubscriptionById = useCallback((id: string): Subscription | undefined => {
    return subscriptions.find(sub => sub.id === id);
  }, [subscriptions]);

  const getActiveSubscriptions = useCallback((): Subscription[] => {
    return subscriptions.filter(sub => sub.is_active);
  }, [subscriptions]);

  const getInactiveSubscriptions = useCallback((): Subscription[] => {
    return subscriptions.filter(sub => !sub.is_active);
  }, [subscriptions]);

  const getUpcomingRenewals = useCallback((days: number = 30): Subscription[] => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return subscriptions.filter(sub => {
      if (!sub.is_active) return false;
      const renewalDate = new Date(sub.renewal_date);
      return renewalDate >= now && renewalDate <= futureDate;
    }).sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime());
  }, [subscriptions]);

  const getTotalMonthlyCost = useCallback((): number => {
    const targetCurrency = profile?.default_currency || DEFAULTS.currency;
    return getActiveSubscriptions().reduce((total, sub) => {
      const monthlyCost = convertToMonthlyCost(sub.cost, sub.billing_cycle);
      const converted = convertCurrency(monthlyCost, sub.currency, targetCurrency);
      return total + converted;
    }, 0);
  }, [getActiveSubscriptions, profile?.default_currency]);

  const getTotalAnnualCost = useCallback((): number => {
    return getTotalMonthlyCost() * 12;
  }, [getTotalMonthlyCost]);

  const refreshSubscriptions = useCallback(async () => {
    await fetchSubscriptions();
  }, [fetchSubscriptions]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clean up duplicate subscriptions
  const cleanupDuplicates = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to clean up duplicates');
      return;
    }

    try {
      const result = await cleanupDuplicateSubscriptions(user.id);

      if (result.success) {
        if (result.duplicatesRemoved > 0) {
          toast.success(`Removed ${result.duplicatesRemoved} duplicate subscription(s)`);
          await fetchSubscriptions(); // Refresh the list
        } else {
          toast.success('No duplicates found');
        }
      } else {
        toast.error(`Failed to clean up duplicates: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Error cleaning up duplicates: ${error.message}`);
    }
  }, [user, fetchSubscriptions]);

  // Effects
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCategories();
    }
  }, [isAuthenticated, user, fetchCategories]);

  useEffect(() => {
    if (isAuthenticated && user && isCategoriesLoaded) {
      fetchSubscriptions();
    }
  }, [isAuthenticated, user, isCategoriesLoaded, fetchSubscriptions]);

  // Track if we've already tried to create dummy data for this user
  const [hasTriedDummyData, setHasTriedDummyData] = useState(false);

  useEffect(() => {
    // Dummy data disabled as per user request
    const shouldCreateDummyData = false;

    if (shouldCreateDummyData && isAuthenticated && user && categories.length > 0 && !isLoading && subscriptions.length === 0 && !hasTriedDummyData) {
      // Create dummy data for new users after a short delay
      const timer = setTimeout(() => {
        createDummyData();
        setHasTriedDummyData(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, categories.length, isLoading, subscriptions.length, createDummyData, hasTriedDummyData]);

  // Reset the flag when user changes
  useEffect(() => {
    setHasTriedDummyData(false);
  }, [user?.id]);

  return {
    subscriptions,
    categories,
    isLoading,
    error,

    // CRUD operations
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,

    // Utility functions
    getSubscriptionById,
    getActiveSubscriptions,
    getInactiveSubscriptions,
    getUpcomingRenewals,
    getTotalMonthlyCost,
    getTotalAnnualCost,

    // Data management
    refreshSubscriptions,
    createDummyData,
    cleanupDuplicates,
    clearError
  };
};

export default useSubscriptions;
