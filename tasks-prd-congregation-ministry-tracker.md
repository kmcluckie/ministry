# Task List: Congregation Ministry Tracker Implementation

## Relevant Files

- `app.vue` - Main application component with layout and navigation
- `pages/index.vue` - Landing page with login/registration forms
- `pages/dashboard.vue` - Main dashboard after authentication
- `pages/persons/index.vue` - Persons list view with search
- `pages/persons/[id].vue` - Person detail view with visit history
- `pages/time/index.vue` - Time tracking list view with filtering
- `components/Person/Form.vue` - Reusable form for creating/editing persons using <script setup> (auto-imports as PersonForm)
- `components/Person/List.vue` - Persons list component with search functionality (auto-imports as PersonList)
- `components/Person/Detail.vue` - Person detail component with visit history (auto-imports as PersonDetail)
- `components/Visit/Form.vue` - Reusable form for adding/editing visits (auto-imports as VisitForm)
- `components/Visit/List.vue` - Visits list for person detail view (auto-imports as VisitList)
- `components/Time/Form.vue` - Reusable form for adding/editing time records (auto-imports as TimeForm)
- `components/Time/List.vue` - Time records list with filtering (auto-imports as TimeList)
- `components/Time/Summary.vue` - Summary cards for total time by type (auto-imports as TimeSummary)
- `components/Layout/Navigation.vue` - Main navigation component (auto-imports as LayoutNavigation)
- `components/UI/LoadingSpinner.vue` - Reusable loading component (auto-imports as UILoadingSpinner)
- `components/UI/ErrorMessage.vue` - Reusable error display (auto-imports as UIErrorMessage)
- `composables/useAuth.ts` - Authentication composable with Pinia store integration
- `composables/usePersons.ts` - Persons data management composable using useSupabaseClient
- `composables/useTime.ts` - Time tracking data management composable using useSupabaseClient
- `composables/useServiceYear.ts` - Utility composable for service year calculations
- `server/api/auth/register.post.ts` - Registration endpoint with serverSupabaseClient
- `server/api/auth/login.post.ts` - Login endpoint with serverSupabaseClient
- `server/api/auth/logout.post.ts` - Logout endpoint with token cleanup
- `server/api/persons/index.get.ts` - Get all persons for authenticated user (server-side)
- `server/api/persons/index.post.ts` - Create new person (server-side validation)
- `server/api/persons/[id].put.ts` - Update person (server-side validation)
- `server/api/persons/[id].delete.ts` - Delete person (server-side)
- `server/api/persons/[id]/visits.get.ts` - Get visits for specific person
- `server/api/visits/index.post.ts` - Create new visit (server-side validation)
- `server/api/visits/[id].put.ts` - Update visit (server-side validation)
- `server/api/visits/[id].delete.ts` - Delete visit (server-side)
- `server/api/time/index.get.ts` - Get all time records for authenticated user
- `server/api/time/index.post.ts` - Create new time record (server-side validation)
- `server/api/time/[id].put.ts` - Update time record (server-side validation)
- `server/api/time/[id].delete.ts` - Delete time record (server-side)
- `stores/auth.ts` - Pinia store for authentication state
- `stores/persons.ts` - Pinia store for persons state management
- `stores/time.ts` - Pinia store for time tracking state
- `types/index.ts` - TypeScript type definitions using types over interfaces
- `utils/dateHelpers.ts` - Date/time utility functions for service year calculations
- `utils/validation.ts` - Form validation utility functions
- `plugins/supabase.client.ts` - Supabase client plugin for auto-import
- `middleware/auth.ts` - Route middleware for protected pages
- `layouts/default.vue` - Main layout with navigation

### Notes

- Use Nuxt UI 3 components and Tailwind CSS for styling
- Follow Nuxt 3 directory structure (pages/, components/, composables/, server/, layouts/, stores/)
- Use <script setup> syntax for all Vue components
- Use Pinia for state management across the application
- All database writes must use server routes with serverSupabaseClient
- Reads can use useSupabaseClient() on client side with RLS enabled
- Use VueUse composables where appropriate (useDateFormat, useToggle, etc.)
- Unit tests should be placed alongside files using Vitest
- Use const objects instead of enums for type definitions

## Tasks

- [ ] 1.0 Set up project foundation with Supabase
    - [ ] 1.1 Install and configure @supabase/supabase-js and @nuxtjs/supabase
    - [ ] 1.2 Create Supabase project and configure database tables (users, persons, visits, time_records)
    - [ ] 1.3 Set up Row Level Security (RLS) policies for user data isolation
    - [ ] 1.4 Configure environment variables for Supabase URL and anon key
    - [ ] 1.5 Create Supabase client plugin for Nuxt auto-import
    - [ ] 1.6 Set up Pinia stores structure (auth, persons, time)
    - [ ] 1.7 Create TypeScript type definitions using const objects
    - [ ] 1.8 Configure Vitest for unit testing
    - [ ] 1.9 Install and configure Nuxt UI 3 with Tailwind CSS

- [ ] 2.0 Implement authentication system with Supabase Auth
    - [ ] 2.1 Configure Supabase Auth with email/password authentication
    - [ ] 2.2 Create auth store (Pinia) for user session management
    - [ ] 2.3 Build registration form component with email/password validation
    - [ ] 2.4 Build login form component with validation and error handling
    - [ ] 2.5 Create auth composable (useAuth) for authentication logic
    - [ ] 2.6 Implement route middleware for protected pages
    - [ ] 2.7 Add logout functionality with session cleanup
    - [ ] 2.8 Create server-side auth validation endpoints
    - [ ] 2.9 Add loading states and error handling for auth flows

- [ ] 3.0 Build Persons management functionality
    - [ ] 3.1 Create persons table in Supabase with RLS policies
    - [ ] 3.2 Create persons store (Pinia) for state management
    - [ ] 3.3 Build GET /api/persons endpoint using serverSupabaseClient
    - [ ] 3.4 Build POST /api/persons endpoint with validation
    - [ ] 3.5 Build PUT /api/persons/[id] endpoint with validation
    - [ ] 3.6 Build DELETE /api/persons/[id] endpoint
    - [ ] 3.7 Create persons composable (usePersons) for client-side data fetching
    - [ ] 3.8 Build Person/Form component using <script setup> and Nuxt UI
    - [ ] 3.9 Build Person/List component to display all persons with search
    - [ ] 3.10 Build Person/Detail component to show person with visits
    - [ ] 3.11 Build Visit/Form component for adding/editing visits
    - [ ] 3.12 Build Visit/List component for displaying visits within person detail
    - [ ] 3.13 Implement form validation using const validation objects

- [ ] 4.0 Build Time tracking functionality
    - [ ] 4.1 Create time_records table in Supabase with RLS policies
    - [ ] 4.2 Create time store (Pinia) for state management
    - [ ] 4.3 Build GET /api/time endpoint using serverSupabaseClient
    - [ ] 4.4 Build POST /api/time endpoint with validation
    - [ ] 4.5 Build PUT /api/time/[id] endpoint with validation
    - [ ] 4.6 Build DELETE /api/time/[id] endpoint
    - [ ] 4.7 Create time composable (useTime) for client-side data fetching
    - [ ] 4.8 Build Time/Form component using <script setup> and Nuxt UI
    - [ ] 4.9 Build Time/List component to display all time records with filtering
    - [ ] 4.10 Build Time/Summary component for total time calculations
    - [ ] 4.11 Create service year calculation composable (useServiceYear)
    - [ ] 4.12 Implement month and service year filtering
    - [ ] 4.13 Add total time calculations by type and period

- [ ] 5.0 Create user interface and navigation with Nuxt UI
    - [ ] 5.1 Create Layout/Navigation component with responsive navigation using Nuxt UI
    - [ ] 5.2 Build landing page with Nuxt UI form components
    - [ ] 5.3 Create dashboard page with recent activity overview
    - [ ] 5.4 Implement responsive navigation between Persons and Time sections
    - [ ] 5.5 Add loading states using Nuxt UI components
    - [ ] 5.6 Implement error handling with Nuxt UI notifications
    - [ ] 5.7 Add confirmation dialogs for delete actions using Nuxt UI
    - [ ] 5.8 Ensure mobile-first responsive design with Tailwind
    - [ ] 5.9 Create reusable UI components for forms and lists
    - [ ] 5.10 Create UI/LoadingSpinner and UI/ErrorMessage reusable components
    - [ ] 5.11 Integrate all components into default layout

- [ ] 6.0 Implement data filtering and reporting features
    - [ ] 6.1 Create service year calculation utility using VueUse date functions
    - [ ] 6.2 Implement month-based filtering with Nuxt UI select components
    - [ ] 6.3 Create summary cards for total time by type using computed properties
    - [ ] 6.4 Add date range filtering with Nuxt UI date pickers
    - [ ] 6.5 Implement sorting using reactive computed properties
    - [ ] 6.6 Create search functionality with debounced input using VueUse
    - [ ] 6.7 Add pagination using Nuxt UI pagination component
    - [ ] 6.8 Implement search across person names and notes
    - [ ] 6.9 Create utility functions for date formatting using VueUse
