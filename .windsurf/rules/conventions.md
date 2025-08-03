---
trigger: always_on
---

### General
- Use VueUse for common composables and utility functions.
- Use Pinia for state management.
- Utilize Nuxt's auto-imports feature for components and composables.

### Nuxt-specific Guidelines
- Follow Nuxt 3 directory structure (e.g., pages/, components/, composables/).
- Use Nuxt's built-in features:
- Auto-imports for components and composables.
- File-based routing in the pages/ directory.
- Server routes in the server/ directory.
- Leverage Nuxt plugins for global functionality.
- Use useFetch and useAsyncData for data fetching.

### Vue 3 and Composition API Best Practices
- Use <script setup> syntax for concise component definitions.
- Leverage ref, reactive, and computed for reactive state management.
- Use provide/inject for dependency injection when appropriate.
- Implement custom composables for reusable logic.

### Supabase
- Writes are Server-Only: All database writes (INSERT, UPDATE, DELETE) must be handled by Nuxt server routes to hide API keys and enforce server-side validation.
- Reads can be Client or Server:
  - Public data: Fetch public, read-only data directly from the client using useSupabaseClient().
  - Private/Sensitive data: Fetch private data via a Nuxt server route.
- Validate on the Server: All data coming from the client must be validated and sanitized within the Nuxt server route before it touches the database.
- Use Correct Tools:
  - Server Routes: Use serverSupabaseClient(event) and defineEventHandler().
  - Client Components: Use useSupabaseClient(), useAsyncData(), or useFetch().
- Enable RLS: Assume all Supabase tables have Row-Level Security enabled and that the client is not trusted.

Follow the official Nuxt.js and Vue.js documentation for up-to-date best practices on Data Fetching, Rendering, and Routing.