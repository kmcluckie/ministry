# Testing Setup

This project uses a multi-layered testing approach with both unit and integration tests.

## Test Types

### Unit Tests (`.test.ts`)
- Fast feedback (< 50ms total)
- Mock external dependencies
- Test business logic and data transformations
- Run on every file save

### Integration Tests (`.integration.test.ts`)
- Real database validation (100-500ms per test)
- Test actual database operations
- Verify schema compatibility
- Run on commit/PR

## Database Testing Strategy

### Option 1: Supabase Branches (Recommended)
Supabase Branches create isolated database environments for testing.

**Setup:**
1. Ensure your Supabase project is on Pro Plan or above
2. Create a branch for testing:
   ```bash
   npx supabase branches create integration-testing
   ```
3. Configure environment variables in `.env.test.local`:
   ```env
   SUPABASE_TEST_BRANCH_URL=https://your-branch-id.supabase.co
   SUPABASE_TEST_BRANCH_ANON_KEY=your-branch-anon-key
   SUPABASE_TEST_BRANCH_SERVICE_KEY=your-branch-service-key
   ```

**Benefits:**
- Complete isolation from production
- Real database with your exact schema
- Automatic cleanup when branch is deleted
- All Supabase features available (Auth, RLS, triggers)

### Option 2: Dedicated Test Database
Create a separate Supabase project for testing.

**Setup:**
1. Create a new Supabase project for testing
2. Apply your migrations to the test project
3. Configure environment variables in `.env.test.local`:
   ```env
   SUPABASE_TEST_URL=https://your-test-project.supabase.co
   SUPABASE_TEST_ANON_KEY=your-test-anon-key
   SUPABASE_TEST_SERVICE_KEY=your-test-service-key
   ```

### Option 3: User Isolation (Fallback)
Uses your main database but isolates test data by generating unique user IDs.

**Setup:**
- No additional setup required
- Tests will use your existing `SUPABASE_URL` and keys
- Each test gets a unique `user_id` to prevent conflicts

## Running Tests

```bash
# Run all tests
npm test

# Run only unit tests (fast)
npm run test:unit

# Run only integration tests
npm run test:integration

# Watch mode for development
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Writing Tests

### Unit Test Example
```typescript
// composables/useExample.test.ts
import { describe, it, expect, vi } from 'vitest'
import { useExample } from './useExample'

describe('useExample', () => {
  it('should return expected value', () => {
    const result = useExample()
    expect(result).toBe(expected)
  })
})
```

### Integration Test Example
```typescript
// repositories/ExampleRepository.integration.test.ts
import { describe, it, expect } from 'vitest'
import { withTestEnvironment } from '../../../tests/utils/test-database'

describe('ExampleRepository Integration', () => {
  it('should save and retrieve data', async () => {
    await withTestEnvironment(async (client, userId) => {
      // Test with real database
      const repository = new ExampleRepository(client)
      // ... test implementation
    })
  })
})
```

## Test Utilities

### `withTestEnvironment()`
Automatically sets up and cleans up test data:

```typescript
await withTestEnvironment(async (client, userId) => {
  // Your test code here
  // Data is automatically cleaned up after the test
})
```

### `generateTestUserId()`
Creates unique user IDs for test isolation:

```typescript
const userId = generateTestUserId() // "test-user-uuid"
```

### `cleanupTestData()`
Manually clean up test data:

```typescript
await cleanupTestData(client, userId)
```

## Performance Guidelines

- **Unit tests**: Should run in < 5ms each
- **Integration tests**: Should run in < 500ms each  
- **Total test suite**: Should complete in < 30s

## Troubleshooting

### Tests timing out
- Check database connection
- Verify environment variables are set
- Ensure test database is accessible

### Data conflicts between tests
- Each test should use a unique `userId`
- Use `beforeEach`/`afterEach` for cleanup
- Consider using `withTestEnvironment()` helper

### Authentication errors
- Verify service role key has proper permissions
- Check RLS policies don't block test operations
- Ensure test users are properly created

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run Tests
  run: |
    npm run test:unit
    npm run test:integration
  env:
    SUPABASE_TEST_URL: ${{ secrets.SUPABASE_TEST_URL }}
    SUPABASE_TEST_SERVICE_KEY: ${{ secrets.SUPABASE_TEST_SERVICE_KEY }}
```