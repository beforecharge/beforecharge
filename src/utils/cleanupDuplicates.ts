import { db } from '@/lib/supabase';

/**
 * Clean up duplicate subscriptions for a user
 * This function removes duplicate subscriptions based on name and user_id
 */
export async function cleanupDuplicateSubscriptions(userId: string): Promise<{
    success: boolean;
    duplicatesRemoved: number;
    error?: string;
}> {
    try {
        // Get all subscriptions for the user
        const { data: subscriptions, error: fetchError } = await db.subscriptions.getAll(userId);

        if (fetchError) {
            return {
                success: false,
                duplicatesRemoved: 0,
                error: fetchError.message
            };
        }

        if (!subscriptions || subscriptions.length === 0) {
            return {
                success: true,
                duplicatesRemoved: 0
            };
        }

        // Group subscriptions by name (case-insensitive)
        const subscriptionGroups = new Map<string, typeof subscriptions>();

        subscriptions.forEach(sub => {
            const key = sub.name.toLowerCase().trim();
            if (!subscriptionGroups.has(key)) {
                subscriptionGroups.set(key, []);
            }
            subscriptionGroups.get(key)!.push(sub);
        });

        // Find duplicates (groups with more than one subscription)
        const duplicatesToRemove: string[] = [];

        subscriptionGroups.forEach((group) => {
            if (group.length > 1) {
                // Keep the most recent one, remove the rest
                const sorted = group.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                // Remove all except the first (most recent)
                for (let i = 1; i < sorted.length; i++) {
                    duplicatesToRemove.push(sorted[i].id);
                }
            }
        });

        if (duplicatesToRemove.length === 0) {
            return {
                success: true,
                duplicatesRemoved: 0
            };
        }

        // Remove duplicates
        const deletePromises = duplicatesToRemove.map(id => db.subscriptions.delete(id, userId));
        const results = await Promise.allSettled(deletePromises);

        const successfulDeletes = results.filter(result => result.status === 'fulfilled').length;

        return {
            success: true,
            duplicatesRemoved: successfulDeletes
        };

    } catch (error: any) {
        return {
            success: false,
            duplicatesRemoved: 0,
            error: error.message
        };
    }
}

/**
 * Check if a user has duplicate subscriptions
 */
export async function checkForDuplicates(userId: string): Promise<{
    hasDuplicates: boolean;
    duplicateCount: number;
    duplicateNames: string[];
}> {
    try {
        const { data: subscriptions, error } = await db.subscriptions.getAll(userId);

        if (error || !subscriptions) {
            return {
                hasDuplicates: false,
                duplicateCount: 0,
                duplicateNames: []
            };
        }

        const nameCount = new Map<string, number>();
        const duplicateNames: string[] = [];

        subscriptions.forEach(sub => {
            const key = sub.name.toLowerCase().trim();
            const count = (nameCount.get(key) || 0) + 1;
            nameCount.set(key, count);

            if (count === 2) {
                duplicateNames.push(sub.name);
            }
        });

        const duplicateCount = Array.from(nameCount.values()).reduce((sum, count) =>
            sum + (count > 1 ? count - 1 : 0), 0
        );

        return {
            hasDuplicates: duplicateCount > 0,
            duplicateCount,
            duplicateNames
        };

    } catch (error) {
        return {
            hasDuplicates: false,
            duplicateCount: 0,
            duplicateNames: []
        };
    }
}