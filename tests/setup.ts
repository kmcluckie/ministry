// Test setup file
// Vitest automatically loads .env files

// Ensure required environment variables are available
if (!process.env.SUPABASE_URL && !process.env.SUPABASE_TEST_URL && !process.env.SUPABASE_TEST_BRANCH_URL) {
  console.warn('⚠️  No test database configured. Integration tests may fail.')
  console.warn('   Set up one of the following:')
  console.warn('   - SUPABASE_TEST_BRANCH_URL (Supabase branching)')
  console.warn('   - SUPABASE_TEST_URL (dedicated test database)')
  console.warn('   - Use main database with user isolation (existing SUPABASE_URL)')
}