Of course. Here is the edited codebase guide. It now includes a new "Project Specifics" section at the top for "i" and has been generalized by removing all mentions of the previous project (school management) and specific CSS variables, while retaining all the architectural patterns and conventions.

***

# Codebase Guide

This document serves as the definitive guide for understanding and contributing to the codebase. It provides patterns, conventions, and architectural decisions that ensure consistency across the project.

## 1. Project Specifics: "i"

This section details the unique aspects of the "i" application. The rest of this guide provides general patterns and conventions applicable to any project built with this stack.

### Core Concept

"i" is an application designed to create meaningful connections between users. Its primary feature is a matching system that pairs users for one-on-one audio/video chats based on shared interests and personality traits, rather than random chance.

### Key Features & Data Flow

1.  **User Onboarding & Profile**:
    *   Users sign in via Google OAuth, managed by **Lucia**.
    *   Users provide a detailed text description of themselves (interests, personality, what they're looking for, etc.). This description is the foundation for matching.

2.  **Matching Flow**:
    *   When a user initiates a search, their text description is sent to the **Gemini API** to generate a vector embedding.
    *   This embedding is used to perform a vector search in the **Qdrant** database to find the most similar user.
    *   The top-matching user is selected as a potential connection.

3.  **Connection & Chat**:
    *   Once a match is found, the two users are connected in a private audio/video chat room facilitated by **PeerJS**.
    *   Simultaneously, both users' original text descriptions are sent to the **Gemini API (specifically, `gemini-1.5-flash`)**.
    *   Gemini compares the two texts and generates a concise list of commonalities. This list is displayed to both users in the chat interface.
    *   **Crucially, this is the *only* information revealed from the descriptions.** This privacy-centric design allows users to be open in their profiles, knowing that only shared traits will be visible to a match.

4.  **Compare Page**:
    *   A secondary feature allows a user to search for another user by their username.
    *   This page uses the same Gemini comparison function to show the commonalities between the current user and the searched user, without initiating a chat.

### Data Model (Qdrant)

All user data is stored in a single Qdrant collection named `'i'`.

*   **Payload Field `s`**: A tenant identifier, always set to `'usr'` for users.
*   **Payload Field `u`**: The user's public username (`string`).
*   **Payload Field `t`**: The user's detailed text description (`string`).
*   **Payload Field `g`**: The user's unique Google ID, used for authentication linkage (`string`).
*   **Vector**: The embedding generated from the user's text description (`t`).

---

> **Qdrant Rule:** Always use `wait: true` for all Qdrant mutation operations (such as `upsert`, `delete`, etc.) to ensure consistency and durability. Do **not** use `wait: true` for read operations (`scroll`, `retrieve`).

## 2. Architectural Overview

### High-Level Architecture

The application follows a **SvelteKit Full-Stack Architecture** with:

- **Frontend**: SvelteKit with TypeScript and Tailwind CSS
- **Backend**: SvelteKit server-side functions and API routes
- **Database**: Qdrant vector database
- **Authentication**: Lucia
- **State Management**: Svelte stores for client-side state

### Data Flow

1.  **Client Request** → SvelteKit Router
2.  **Server Load Functions** → Database queries via `src/lib/db.ts`
3.  **Component Rendering** → Data passed via PageData types
4.  **Form Submissions** → Server Actions → Database operations
5.  **Client State** → Svelte stores (toast notifications, auth state)

### Data Partitioning Pattern

All primary data is stored in a single Qdrant collection `'i'` with data type isolation via the `s` field:

- `s: 'usr'` - Users

## 3. Directory Structure & File Organization

### Core Structure

```
src/
├── lib/                    # Reusable modules and utilities
│   ├── components/         # Shared Svelte components
│   │   ├── ui/            # Design system components
│   │   └── *.svelte       # Feature-specific components
│   ├── stores/            # Svelte stores for state management
│   ├── types/             # TypeScript type definitions
│   ├── db.ts              # Database operations layer
│   ├── auth.ts            # Authentication (Lucia) setup
│   ├── constants.ts       # Application constants
│   └── utils.ts           # Utility functions
├── routes/                # SvelteKit file-based routing
│   ├── +layout.svelte     # Root layout component
│   ├── +page.server.ts    # Server-side page logic
│   ├── +page.svelte       # Page components
│   └── [dynamic]/         # Dynamic route segments
└── (styles)/              # Global styles directory
```

### File Naming Conventions

- **Pages**: `+page.svelte`, `+page.server.ts`
- **Layouts**: `+layout.svelte`, `+layout.server.ts`
- **API Routes**: `+server.ts`
- **Components**: `PascalCase.svelte` (e.g., `ChatWindow.svelte`)
- **Types**: `types.ts` or `*.d.ts`
- **Tests**: `*.test.ts` (unit), `*.spec.ts` (e2e)

## 4. Coding Style & Conventions

### Naming Conventions

- **Variables/Functions**: `snake_case`
- **Classes/Components**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Database Fields**: Single or double letter abbreviations (`t` for text, `g` for googleId, `u` for username, `s` for tenant)
- **Types/Interfaces**: `PascalCase` with descriptive names

### TypeScript Standards

- Strict null checks enabled
- Use SvelteKit generated types (`import type { PageData } from './$types'`)
- Define all entities in `src/lib/types.ts`
- Prefer interfaces over types for object shapes

## 5. Key Design & Implementation Patterns

### Server Load Pattern

**Purpose**: Fetch initial data for pages from the database

```typescript
// +page.server.ts
import { getById } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return {
		item: await getById(params.id)
	};
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<h1>{data.item.title}</h1>
```

### Form Action Pattern

**Purpose**: Handle form submissions with server-side processing

```typescript
// +page.server.ts
import type { Actions } from './$types';
import { fail, error } from '@sveltejs/kit';
import { qdrant } from '$lib/db';

export const actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.user) throw error(401, 'Not logged in');
		const formData = await request.formData();
		const res = await qdrant.setPayload('i', {
			wait: true,
			payload: { u: formData.get('username') }, // example: updating a username
			points: [params.id]
		});

		return { success: true };
	}
} satisfies Actions;
```

```svelte
<!-- Form usage -->
<form method="POST">
	<input name="username" required />
	<button type="submit">Save</button>
</form>
```

### Database Access Pattern

**Purpose**: Consistent database operations with type isolation

```typescript
// Always use type-aware queries
const users = await searchByPayload<User>({
	s: 'usr', // Type identifier
	u: 'some_user' // Additional filters
});

// For single record retrieval
const user = await getById<User>(userId);

// For creating records
const newRecord = await upsertPoint({
	s: 'usr',
	u: 'new_user',
	t: 'A long description about myself...',
	g: 'google-user-id-123'
	// ... vector would be added here
});

// For updating records
// Assuming `id` is the point ID
await qdrant.setPayload('i', {
	wait: true,
	payload: { u: `new_username` },
	points: [id]
});
```

### Component State Pattern

**Purpose**: Manage component lifecycle and reactivity

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	export let data: PageData;

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

<div transition:fade>
	<!-- Content -->
</div>
```

### Error Handling Pattern

**Purpose**: Consistent error handling with user feedback

```typescript
// Server-side error handling
import { error, fail } from '@sveltejs/kit';

// For page load errors
if (!resource) {
	throw error(404, 'Resource not found');
}

// For form action errors
if (!validInput) {
	return fail(400, { error: 'Invalid input provided' });
}
```

```svelte
<!-- Client-side error handling -->
<script lang="ts">
	import { toast } from '$lib/stores/toast';

	async function handleSubmit() {
		try {
			const response = await fetch('/api/endpoint');
			if (!response.ok) throw new Error('Request failed');
			toast.success('Operation completed successfully');
		} catch (err) {
			toast.error('Operation failed: ' + err.message);
		}
	}
</script>
```

### Toast Notification Pattern

**Purpose**: User feedback for actions and errors

```typescript
// Using the toast store
import { toast } from '$lib/stores/toast';

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

### Authentication Pattern (Lucia)

**Purpose**: Protect routes and access user context

```typescript
// Server-side auth requirement in a load function or action
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.auth.validateUser();
	if (!user) {
		throw error(401, 'You must be logged in to access this page.');
	}
	// Use user for authenticated operations
};
```

### API Route Pattern

**Purpose**: RESTful API endpoints for client-side fetches or external integrations

```typescript
// +server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');
	const results = await searchByPayload({ s: 'usr', u: query }); // Example: find user by username
	return json({ results });
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const result = await upsertPoint(data);
	return json({ success: true, data: result });
};
```

### UI Component Pattern

**Purpose**: Consistent component structure

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

## 6. Development Workflow

### Package Management

- **Always use package managers** instead of manually editing `package.json`.
- Use `npm i <package>` for dependencies.
- Use `npm i -D <package>` for dev dependencies.

### Code Quality

- **Linting**: ESLint with TypeScript and Svelte plugins.
- **Formatting**: Prettier with Svelte and Tailwind plugins.
- **Type Checking**: `npm run check` before commits.

### Testing Strategy

- **Unit Tests**: Focus on utility functions, business logic, and database helpers.
- **E2E Tests**: Cover critical user journeys like authentication, profile editing, and the matching flow.
- **Minimum Coverage**: Strive for 80% coverage on core logic.

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

## 7. Architecture Decisions

### Database Design

- **Single Collection**: All primary data resides in the Qdrant collection `'i'` for operational simplicity.
- **Type Isolation**: Using the `s` payload field to distinguish between different types of data (e.g., `'usr'`).
- **Short Field Names**: Optimized for storage and reduced payload size (`u` for username, `t` for text, `g` for googleId).
- **UUID v7**: Time-ordered UUIDs are used for point IDs for better indexing performance and natural sorting by creation time.

### Authentication Strategy

- **Lucia**: Provides robust session management and OAuth integration. Configuration is centralized in `src/lib/auth.ts`. All session validation occurs on the server.

### State Management

- **Server State**: Handled primarily by SvelteKit's `load` functions, ensuring data is fetched server-side before page render.
- **Client State**: Limited to UI-specific concerns (e.g., auth status, toast notifications) and managed with Svelte stores.
- **Form State**: Handled via native HTML forms and SvelteKit Actions, embracing progressive enhancement.

### Performance Considerations

- **Lazy Loading**: SvelteKit's file-based routing naturally lazy-loads code for each page.
- **Efficient Queries**: Database queries are designed to be specific, leveraging Qdrant's filtering capabilities alongside vector search.
- **Minimal JavaScript**: SSR-first approach with selective client-side hydration.
- **Caching**: Standard browser caching for static assets is enabled by default.

## 8. Common Pitfalls to Avoid

1.  **Database Queries**: Always include the `s` field in queries to ensure you are targeting the correct data type.
2.  **Authentication**: Never rely on client-side checks for security. All sensitive operations must be validated on the server using the `locals.auth` object.
3.  **Form Validation**: Validate all user input on both the client (for UX) and the server (for security).
4.  **Error Handling**: Always provide user-friendly error messages via `fail` in actions or the `toast` store for client-side operations.
5.  **Type Safety**: Leverage SvelteKit's generated types (`./$types`) and define shared interfaces in `src/lib/types.ts`.
6.  **Styling**: Use the established design system (e.g., Tailwind classes) instead of hardcoding values or one-off styles.
7.  **Testing**: Ensure tests cover both the "happy path" and potential error scenarios or edge cases.

This guide should be updated as the codebase evolves to maintain accuracy and usefulness for all contributors.