import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database.types'
import crypto from 'crypto'

// Test database configuration
interface TestConfig {
  url: string
  serviceKey: string
  anonKey: string
}

/**
 * Get test database configuration
 * Supports both Supabase branches and dedicated test environments
 */
export function getTestConfig(): TestConfig {
  // Option 1: Use Supabase branch (if available)
  if (process.env.SUPABASE_TEST_BRANCH_URL) {
    return {
      url: process.env.SUPABASE_TEST_BRANCH_URL,
      serviceKey: process.env.SUPABASE_TEST_BRANCH_SERVICE_KEY!,
      anonKey: process.env.SUPABASE_TEST_BRANCH_ANON_KEY!
    }
  }
  
  // Option 2: Use dedicated test database
  if (process.env.SUPABASE_TEST_URL) {
    return {
      url: process.env.SUPABASE_TEST_URL,
      serviceKey: process.env.SUPABASE_TEST_SERVICE_KEY!,
      anonKey: process.env.SUPABASE_TEST_ANON_KEY!
    }
  }
  
  // Option 3: Use main database with test user isolation (fallback)
  return {
    url: process.env.SUPABASE_URL!,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    anonKey: process.env.SUPABASE_ANON_KEY!
  }
}

/**
 * Create a Supabase client for testing
 */
export function createTestClient(): SupabaseClient<Database> {
  const config = getTestConfig()
  return createClient<Database>(config.url, config.serviceKey)
}

/**
 * Create an admin client for test setup/teardown
 */
export function createTestAdminClient(): SupabaseClient<Database> {
  const config = getTestConfig()
  return createClient<Database>(config.url, config.serviceKey)
}

/**
 * Generate a unique test user ID to isolate test data
 */
export function generateTestUserId(): string {
  return `test-user-${crypto.randomUUID()}`
}

/**
 * Clean up all test data for a specific user
 */
export async function cleanupTestData(
  client: SupabaseClient<Database>, 
  userId: string
): Promise<void> {
  // Delete in reverse order of foreign key dependencies
  
  // 1. Delete visits first
  const { error: visitsError } = await client
    .from('visits')
    .delete()
    .eq('user_id', userId)
  
  if (visitsError) {
    console.warn('Error cleaning up visits:', visitsError)
  }
  
  // 2. Delete persons
  const { error: personsError } = await client
    .from('persons')  
    .delete()
    .eq('user_id', userId)
  
  if (personsError) {
    console.warn('Error cleaning up persons:', personsError)
  }
  
  // 3. Delete auth users (if using test branch)
  if (process.env.SUPABASE_TEST_BRANCH_URL) {
    const { error: authError } = await client.auth.admin.deleteUser(userId)
    if (authError) {
      console.warn('Error cleaning up auth user:', authError)
    }
  }
}

/**
 * Set up test data for integration tests
 */
export async function setupTestData(
  client: SupabaseClient<Database>,
  userId: string
): Promise<void> {
  // Create test auth user if using test branch
  if (process.env.SUPABASE_TEST_BRANCH_URL) {
    await client.auth.admin.createUser({
      id: userId,
      email: `${userId}@test.com`,
      password: 'test123456',
      email_confirm: true
    })
  }
}

/**
 * Wait for database operations to complete
 * Useful for eventual consistency scenarios
 */
export async function waitForDatabase(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create a test environment that automatically cleans up
 */
export async function withTestEnvironment<T>(
  testFn: (client: SupabaseClient<Database>, userId: string) => Promise<T>
): Promise<T> {
  const client = createTestClient()
  const userId = generateTestUserId()
  
  try {
    await setupTestData(client, userId)
    return await testFn(client, userId)
  } finally {
    await cleanupTestData(client, userId)
  }
}