import { isSupabaseConfigured, supabase } from "./supabase";
import { DEFAULT_CATEGORIES } from "./constants";
import { Database } from "@/types/database.types";

interface DatabaseInitResult {
  success: boolean;
  message: string;
  categoriesCreated?: number;
  error?: string;
}

/**
 * Initialize the database with default data
 * This function ensures that default categories exist in the database
 */
export async function initializeDatabase(): Promise<DatabaseInitResult> {
  try {
    console.log("🔍 Checking database connection...");

    // Test database connection
    const { error: testError } = await supabase
      .from("categories")
      .select("count")
      .limit(1);

    if (testError) {
      return {
        success: false,
        message: "Failed to connect to database",
        error: testError.message,
      };
    }

    console.log("✅ Database connection successful");

    // Check if default categories already exist
    const { data: existingCategories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_default", true);

    if (categoriesError) {
      return {
        success: false,
        message: "Failed to check existing categories",
        error: categoriesError.message,
      };
    }

    const existingCategoryNames = new Set(
      existingCategories?.map((cat) => cat.name) || [],
    );

    // Filter out categories that already exist
    const categoriesToCreate = DEFAULT_CATEGORIES.filter(
      (cat) => !existingCategoryNames.has(cat.name),
    );

    if (categoriesToCreate.length === 0) {
      console.log("✅ All default categories already exist");
      return {
        success: true,
        message: "Database already initialized with default categories",
        categoriesCreated: 0,
      };
    }

    console.log(
      `📝 Creating ${categoriesToCreate.length} default categories...`,
    );

    // Create missing default categories
    const categoryInserts: Database["public"]["Tables"]["categories"]["Insert"][] =
      categoriesToCreate.map((category) => ({
        name: category.name,
        icon: category.icon,
        color: category.color,
        is_default: true,
        user_id: null, // Default categories don't belong to any user
      }));

    const { data: createdCategories, error: createError } = await supabase
      .from("categories")
      .insert(categoryInserts)
      .select("id, name");

    if (createError) {
      return {
        success: false,
        message: "Failed to create default categories",
        error: createError.message,
      };
    }

    const createdCount = createdCategories?.length || 0;
    console.log(`✅ Successfully created ${createdCount} default categories`);

    return {
      success: true,
      message: `Database initialized successfully with ${createdCount} new categories`,
      categoriesCreated: createdCount,
    };
  } catch (error: any) {
    console.error("❌ Database initialization error:", error);
    return {
      success: false,
      message: "Unexpected error during database initialization",
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Check if the database is properly set up and accessible
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  tablesExist: boolean;
  categoriesCount: number;
  error?: string;
}> {
  try {
    // Test basic connection
    const { error: connectionError } = await supabase
      .from("categories")
      .select("count")
      .limit(1);

    if (connectionError) {
      return {
        connected: false,
        tablesExist: false,
        categoriesCount: 0,
        error: connectionError.message,
      };
    }

    // Check if required tables exist by querying them
    const tables = ["categories", "subscriptions", "profiles", "tags"];
    let tablesExist = true;

    for (const table of tables) {
      const { error } = await supabase
        .from(table as any)
        .select("count")
        .limit(1);

      if (error) {
        tablesExist = false;
        break;
      }
    }

    // Get categories count
    const { count: categoriesCount } = await supabase
      .from("categories")
      .select("*", { count: "exact" })
      .eq("is_default", true);

    return {
      connected: true,
      tablesExist,
      categoriesCount: categoriesCount || 0,
    };
  } catch (error: any) {
    return {
      connected: false,
      tablesExist: false,
      categoriesCount: 0,
      error: error.message,
    };
  }
}

/**
 * Reset database (for development/testing only)
 * WARNING: This will delete all user data!
 */
export async function resetDatabase(): Promise<DatabaseInitResult> {
  if (import.meta.env.PROD) {
    return {
      success: false,
      message: "Database reset is not allowed in production",
      error: "Operation not permitted",
    };
  }

  try {
    console.log("⚠️  RESETTING DATABASE - This will delete all data!");

    // Delete in order of dependencies
    await supabase
      .from("reminder_jobs")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("receipts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("notifications")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("subscriptions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("tags")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("categories").delete().eq("is_default", false);
    await supabase
      .from("profiles")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("🗑️  Database cleared");

    // Reinitialize with default data
    const initResult = await initializeDatabase();

    return {
      success: initResult.success,
      message: `Database reset and reinitialized. ${initResult.message}`,
      categoriesCreated: initResult.categoriesCreated,
      error: initResult.error,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to reset database",
      error: error.message,
    };
  }
}

/**
 * Auto-initialize database on app startup
 * This function is called when the app starts to ensure the database is ready
 */
export async function autoInitializeDatabase(): Promise<void> {
  try {
    // Only auto-initialize if we have a valid Supabase configuration
    if (!isSupabaseConfigured) {
      console.log(
        "⚠️  Skipping database initialization - Supabase not configured",
      );
      return;
    }

    console.log("🚀 Auto-initializing database...");

    const result = await initializeDatabase();

    if (result.success) {
      console.log(`✅ ${result.message}`);
    } else {
      console.error(`❌ Database initialization failed: ${result.error}`);
    }
  } catch (error: any) {
    console.error("❌ Auto-initialization error:", error);
  }
}
