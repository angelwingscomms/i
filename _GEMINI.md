# Codebase Guide

Codebase guide: patterns, conventions, architecture for project consistency.

### Data Model (Qdrant)

All user data in single Qdrant collection: `'i'`.

*   **Payload Field `s`**: Tenant ID. Always `'u'` for users.
*   **Payload Field `t`**: User tag/username (`string`).
*   **Payload Field `d`**: User detailed text description (`string`).
*   **Payload Field `a`**: User age (`number`).
*   **Payload Field `g`**: User gender (`number`) - 0: male, 1: female.
*   **Payload Field `l`**: User latitude (`number`).
*   **Payload Field `n`**: User longitude (`number`).
*   **Payload Field `w`**: User WhatsApp link (`string`).
*   **Vector**: Embedding from user text description (`d`).

---

> **Qdrant Rule:** `wait: true` for Qdrant mutation operations (`upsert`, `delete`) for consistency/durability.

## 2. Architectural Overview

### High-Level Architecture

**SvelteKit Full-Stack Architecture**:

-   **Frontend**: SvelteKit, TypeScript, Tailwind CSS
-   **Backend**: SvelteKit server-side functions/API routes
-   **Database**: Qdrant vector database
-   **Authentication**: Lucia pattern
-   **State Management**: Svelte stores (client-side)

### Data Flow

1.  **Client Request** → SvelteKit Router
2.  **Server Load Functions** → Database queries (`src/lib/db.ts`)
3.  **Component Rendering** → Data via PageData types
4.  **Form Submissions** → Server Actions → Database operations
5.  **Client State** → Svelte stores (toast, auth)

### Data Partitioning Pattern - Multitenancy

All data stored in single Qdrant collection `'i'`, isolated by `s` field:

-   `s: 'u'` - Users

## 3. Design System
defined in src/app.css

### File Naming Conventions

-   **Components**: `PascalCase.svelte` (e.g., `ChatWindow.svelte`)
-   **Types**: `types.ts` or `*.d.ts`
-   **Tests**: `*.test.ts` (unit), `*.spec.ts` (e2e)

## 5. Code style

### Naming Conventions

-   **Variables/Functions**: `snake_case`
-   **Database Fields**: Single/double letter (`t` text, `g` googleId, `u` username, `s` tenant)

## other styles
- define all types in `src/lib/types`.
- for db stuff, always use the db helper functions in src/lib/db/index.ts
- always use api routes to get data from client to server, e.g routes/search/+server.ts
- always use wait: true for qdrant write ops
- always use svelte fade transition in UI when you want

### Component State Pattern

Manage component lifecycle, reactivity.

```svelte
<script lang="ts">
	let loading = false;

	async function handleAction() {
		loading = true;
		try {
			// Perform action
		} finally {
			loading = false;
		}
	}
</script>
```

### Error Handling Pattern

in server files(e.g endpoint or page load), handle errors so:
```typescript
import { error } from '@sveltejs/kit';
throw error(404, 'Resource not found');
```

### Toast Notification Pattern

User feedback for actions, errors.

```typescript
// Using the toast store
import { toast } from '$lib/toast';

// Success notification
toast.success('Record saved successfully');

// Error notification
toast.error('Failed to save record');

// Custom notification
toast.add({
	type: 'warning',
	message: 'Please review your input',
	duration: 8000
});
```

to get logged in user

```typescript
export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;
};
```

### API Route Pattern

RESTful API endpoints for client-side fetches/external integrations.

```typescript
// +server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');
	const results = await searchByPayload({ s: 'u', u: query }); // Example: find user by username
	return json({ results });
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const result = await upsertPoint(data);
	return json({ success: true, data: result });
};
```

### UI Component Pattern

Consistent component structure.

```svelte
<!-- Component structure -->
<script lang="ts">
	// Props with defaults
	export let variant: 'primary' | 'secondary' = 'primary';
	export let disabled = false;
	export let extraClass = '';

	// Event forwarding
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function handleClick(event) {
		if (!disabled) {
			dispatch('click', event);
		}
	}
</script>

<button
	class:btn-primary={variant === 'primary'}
	class:btn-secondary={variant === 'secondary'}
	class={extraClass}
	{disabled}
	on:click={handleClick}
>
	<slot />
</button>

<style>
	/*
			Component-scoped styles go here.
			Prefer using Tailwind CSS classes in the template
			for consistency with the design system.
	*/
</style>
```

### Testing Patterns

#### Unit Testing (Vitest)

```typescript
// *.test.ts
import { describe, it, expect } from 'vitest';
import { someUtilityFunction } from './utils';

describe('Utility Functions', () => {
	it('should perform its operation correctly', () => {
		const result = someUtilityFunction('input');
		expect(result).toBe('expected_output');
	});
});
```

#### E2E Testing (Playwright)

```typescript
// *.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Matching Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/find-match');
	});

	test('should successfully find a match and show commonalities', async ({ page }) => {
		await page.click('button:has-text("Find a Connection")');
		await expect(page.locator('text=You have in common:')).toBeVisible();
	});
});
```

## 7. Development Workflow

### Package Management

-   Always use package managers.
-   `npm i <package>` for deps.
-   `npm i -D <package>` for dev deps.

### Code Quality

-   **Linting**: ESLint (TS, Svelte plugins).
-   **Formatting**: Prettier (Svelte, Tailwind plugins).
-   **Type Checking**: `npm run check` pre-commits.

### Testing Strategy

-   **Unit Tests**: Focus: utility, business logic, DB helpers.
-   **E2E Tests**: Cover critical user journeys (auth, profile edit, matching).
-   **Minimum Coverage**: Strive 80% on core logic.

### Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run check

# Linting and formatting
npm run lint
npm run format

# Testing
npm run test:unit
npm run test:e2e
npm run test:all

# Database (Docker)
npm run qdrant:start
npm run qdrant:stop
```

## 8. Architecture Decisions

### Database Design

-   **Single Collection**: All primary data in Qdrant `'i'` (operational simplicity).
-   **Type Isolation**: `s` payload field distinguishes data types (e.g., `'u'`).
-   **Short Field Names**: Optimized for storage, reduced payload (`u` for username, `t` for text, `g` for googleId).
-   **UUID v7**: Time-ordered UUIDs for point IDs (better indexing, natural sorting by creation).

### Authentication Strategy

-   Follows Lucia pattern. Config in `src/lib/auth.ts`. All session validation server-side.

### State Management

-   **Server State**: SvelteKit `load` functions (server-side data fetch pre-render).
-   **Client State**: Limited to UI (auth status, toasts); Svelte stores.
-   **Form State**: Native HTML forms, SvelteKit Actions (progressive enhancement).

### Performance Considerations

-   **Lazy Loading**: SvelteKit routing lazy-loads page code.
-   **Efficient Queries**: Specific DB queries, Qdrant filtering, vector search.
-   **Minimal JavaScript**: SSR-first, selective hydration.
-   **Caching**: Standard browser caching for static assets.

## 9. Common Pitfalls to Avoid

1.  **Database Queries**: Always include `s` field for correct data type.
2.  **Authentication**: Never rely on client-side security checks. Sensitive ops: server-side with `locals.user`.
3.  **Form Validation**: Validate input client-side (UX) and server-side (security).
4.  **Error Handling**: Provide user-friendly errors via `fail` (actions) or `toast` store (client-side).
5.  **Type Safety**: Leverage SvelteKit generated types (`./$types`), define shared interfaces in `src/lib/types.ts`.
6.  **Styling**: Use design system (Tailwind classes) over hardcoding/one-off styles.
7.  **Testing**: Cover "happy path" and error scenarios/edge cases.

Guide update as codebase evolves.