# Code Architecture

## Frontend Component Patterns

### Form/Modal Component Structure
Components follow a layered pattern for forms and modals:
1. **Form Component** (`[Entity]/Form.vue`): Pure form UI, emits events, accepts props
   - Uses Zod schemas from `shared/validation/` for validation
   - Emits `submit` and `cancel` events
   - Accepts `initialData`, `submitLabel`, `loading` props
2. **Modal Wrapper** (`[Entity]/AddModal.vue`, `[Entity]/EditModal.vue`): Handles modal state
   - Wraps Form component inside UModal
   - Manages open/close state via v-model pattern
   - Passes data and events between page and form
3. **Page Component** (`pages/[entity]/index.vue`): Orchestrates API calls and state
   - Manages modal visibility state
   - Handles form submissions via API routes
   - Implements realtime updates where applicable

## Backend Hexagonal Architecture

All backend code follows Domain-Driven Design within `server/bounded-contexts/`:

### Layer Structure (per bounded context)
1. **Domain Layer** (`domain/`)
   - `entities/`: Core business entities with validation and business rules
   - `repositories/`: Repository interfaces (ports)
   - `errors/`: Domain-specific error types
2. **Application Layer** (`application/use-cases/`)
   - Pure functions implementing business operations
   - Validates input using shared schemas
   - Orchestrates domain entities and repositories
3. **Infrastructure Layer** (`infrastructure/`)
   - `repositories/`: Concrete repository implementations (e.g., Supabase)
   - `dependencies.ts`: Dependency injection factory

### API Routes Pattern
Routes in `server/api/` are thin controllers that:
1. Use `defineApiHandler` for error handling
2. Call `create[Context]Dependencies(event)` for dependency injection
3. Execute use case with injected dependencies
4. Return formatted DTOs via `format[Entity]Response`

## Shared Code

### Validation (`shared/validation/`)
- Zod schemas shared between frontend and backend
- Single source of truth for data validation
- Exports both schemas and TypeScript types

## Conventions

### Tech Stack
- **Frontend**: Nuxt 3, Vue 3 Composition API, TypeScript
- **UI**: Nuxt UI 3, Tailwind CSS
- **Backend**: Nuxt server routes, Supabase
- **State**: Pinia stores, VueUse composables
- **Validation**: Zod schemas (shared frontend/backend)

### Code Style
- Use `<script setup>` syntax for components
- Prefer types over interfaces
- Use const objects instead of enums
- Descriptive variable names with auxiliary verbs (isLoading, hasError)
- Structure: exported component, composables, helpers, types

### Supabase Guidelines
- **Writes are Server-Only**: All database writes via server routes
- **Reads**: Client-side for public data, server-side for private
- **Validation**: Server-side validation before database operations
- **RLS**: Always enabled, client is untrusted

### Development Commands
- Typecheck: `npx nuxi typecheck`
- Lint: `npm run lint --fix`

### MCP Tools
- **context7**: Library documentation
- **serena**: Semantic code search
- **supabase**: Database operations