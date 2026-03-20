/**
 * Script to create test users for BeforeCharge
 * Run with: npx tsx scripts/create-test-users.ts
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL or SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease set these in your .env.local file or environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface TestUser {
  email: string;
  password: string;
  fullName: string;
  planType: 'free' | 'premium';
}

const TEST_USERS: TestUser[] = [
  {
    email: 'test.free@beforecharge.com',
    password: 'TestFree123!',
    fullName: 'Free Test User',
    planType: 'free',
  },
  {
    email: 'test.premium@beforecharge.com',
    password: 'TestPremium123!',
    fullName: 'Premium Test User',
    planType: 'premium',
  },
];

async function createTestUser(user: TestUser) {
  console.log(`\n📝 Creating test user: ${user.email}`);

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === user.email);

    let userId: string;

    if (existingUser) {
      console.log(`   ℹ️  User already exists, using existing user`);
      userId = existingUser.id;
    } else {
      // Create user using admin API
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: user.fullName,
        },
      });

      if (createError) {
        throw createError;
      }

      if (!newUser.user) {
        throw new Error('User creation failed - no user returned');
      }

      userId = newUser.user.id;
      console.log(`   ✅ User created with ID: ${userId}`);
    }

    // Update or create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: user.email,
        full_name: user.fullName,
        subscription_plan: user.planType,
        subscription_status: 'active',
        subscription_start_date: user.planType === 'premium' ? new Date().toISOString() : null,
        subscription_end_date:
          user.planType === 'premium'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : null,
        currency: 'USD',
        notification_preferences: {
          email_reminders: true,
          push_notifications: true,
          weekly_summary: true,
        },
      })
      .select()
      .single();

    if (profileError) {
      console.log(`   ⚠️  Profile error: ${profileError.message}`);
    } else {
      console.log(`   ✅ Profile created/updated`);
    }

    // Create test data using the database function
    const { error: testDataError } = await supabase.rpc('create_test_user_data', {
      p_user_id: userId,
      p_plan_type: user.planType,
    });

    if (testDataError) {
      console.log(`   ⚠️  Test data error: ${testDataError.message}`);
      console.log(`   ℹ️  You may need to run the migration first`);
    } else {
      console.log(`   ✅ Test subscriptions and data created`);
    }

    console.log(`\n   🎉 Test user ready!`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔑 Password: ${user.password}`);
    console.log(`   📦 Plan: ${user.planType.toUpperCase()}`);

    return { success: true, userId };
  } catch (error: any) {
    console.error(`   ❌ Error creating user: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 BeforeCharge Test User Creation Script');
  console.log('==========================================\n');

  const results = [];

  for (const user of TEST_USERS) {
    const result = await createTestUser(user);
    results.push({ user: user.email, ...result });
  }

  console.log('\n\n📊 Summary');
  console.log('==========');
  results.forEach((result) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.user}`);
  });

  const successCount = results.filter((r) => r.success).length;
  console.log(`\n${successCount}/${results.length} users created successfully`);

  if (successCount > 0) {
    console.log('\n🎯 Next Steps:');
    console.log('1. Visit your app login page');
    console.log('2. Sign in with one of the test accounts above');
    console.log('3. Explore the pre-populated subscriptions and features');
  }

  process.exit(successCount === results.length ? 0 : 1);
}

main();
