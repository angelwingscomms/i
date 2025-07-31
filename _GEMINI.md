# Codebase Guide

Codebase guide: patterns, conventions, architecture for project consistency.

## 1. Project Specifics: "i"

"i" application unique aspects. Rest: general stack patterns/conventions.

### Core Concept

"i": connect users. Matches for 1:1 chats based on shared interests, traits, location, age, gender. Not random.

### Key Features & Data Flow

1.  **User Onboarding & Profile**:
				*   Users provide: tag/username, detailed text description (interests, personality, looking for), age, gender, location coords, WhatsApp link. Description: matching foundation.

2.  **Matching Flow**:
				*   User search (filters: gender, age range) → text description to **Gemini API** for vector embedding.
				*   Embedding → vector search in **Qdrant** for similar users matching filters.
				*   Top-matching users returned as connections.

3.  **Connection & Chat**:
				*   Match found → users connected in private audio/video chat via **PeerJS**.
				*   Simultaneously: both users' text descriptions to **Gemini API (`gemini-1.5-flash`)**.
				*   Gemini compares texts, generates concise commonalities list. List displayed in chat.
				*   **Crucial: Only commonalities revealed from descriptions.** Privacy-centric: users open in profiles, knowing only shared traits visible to match.

4.  **Compare Page**:
				*   Secondary feature: search user by username.
				*   Uses same Gemini comparison: shows commonalities between current user and searched user, no chat initiation.

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

> **Qdrant Rule:** `wait: true` for Qdrant mutation operations (`upsert`, `delete`) for consistency/durability. `wait: false` (or omit) for read operations (`scroll`, `retrieve`).

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
### Primary Colors

```css
/* CSS Custom Properties */
--dreamwave-violet: #B637FA;
--dreamwave-pink: #FA378B;
--dreamwave-magenta: #F737FA;
--dreamwave-indigo: #7837FA;
--dreamwave-error: #FA3A2F;      /* Errors/danger */
--dreamwave-light-mauve: #F889FA;

/* Foundational Colors */
--background-primary: #FFFFFF;
--text-primary: #1A1A2E;     /* Dark, readable */
--text-on-color: #FFFFFF;    /* On vibrant backgrounds */
```

### Semantic Mapping

-   **Primary Actions**: Dreamwave Indigo (`#7837FA`).
-   **Secondary Actions**: Dreamwave Violet (`#B637FA`).
-   **Accent & Highlight**: Dreamwave Pink (`#FA378B`).
-   **Critical/Danger**: Dreamwave Error (`#FA3A2F`). Only for warnings, errors, destructive actions.
-   **Text**: Text Primary (`#1A1A2E`). High-contrast.
-   **Subtle Backgrounds**: Dreamwave Light Mauve (`#F889FA`). For gentle highlights/disabled states.

## Typography

### Scale
```css
--text-whisper: 0.75rem    /* 12px */
--text-breath: 0.875rem    /* 14px */
--text-flow: 1rem          /* 16px */
--text-wave: 1.125rem      /* 18px */
--text-tide: 1.25rem       /* 20px */
--text-horizon: 1.5rem     /* 24px */
--text-sky: 2rem           /* 32px */
--text-cosmos: 3rem        /* 48px */
```

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
```

## Spacing System

Consistent 4px-based scale.

```css
--space-atom: 0.125rem     /* 2px */
--space-whisper: 0.25rem   /* 4px */
--space-breath: 0.5rem     /* 8px */
--space-pulse: 0.75rem     /* 12px */
--space-flow: 1rem         /* 16px */
--space-wave: 1.5rem       /* 24px */
--space-tide: 2rem         /* 32px */
--space-horizon: 3rem      /* 48px */
--space-sky: 4rem          /* 64px */
--space-cosmos: 6rem       /* 96px */
```

## Border Radius

Soft, rounded corners: core visual identity.

```css
--radius-medium: 0.75rem;    /* 12px - Cards, larger containers */
--radius-large: 1.25rem;     /* 20px - Modals, page containers */
--radius-full: 9999px;       /* Pill buttons, tags */
```

## Shadows

Clean, soft shadows; depth without heaviness.

```css
--shadow-whisper: 0 1px 3px 0 rgba(26, 26, 46, 0.05);
--shadow-breath: 0 2px 8px 0 rgba(26, 26, 46, 0.06);
--shadow-float: 0 4px 16px 0 rgba(26, 26, 46, 0.08);
--shadow-dream: 0 8px 32px 0 rgba(26, 26, 46, 0.10);
--shadow-transcend: 0 16px 64px 0 rgba(26, 26, 46, 0.12);
```

## Animation

### Timing
```css
--timing-instant: 0ms
--timing-breath: 150ms     /* Quick */
--timing-heartbeat: 300ms  /* Standard */
--timing-wave: 500ms       /* Gentle */
--timing-tide: 800ms       /* Thoughtful */
```

### Easing
```css
--ease-breath: cubic-bezier(0.4, 0, 0.2, 1)      /* Natural accel */
--ease-float: cubic-bezier(0.25, 0.46, 0.45, 0.94) /* Gentle float */
--ease-dream: cubic-bezier(0.23, 1, 0.32, 1)     /* Smooth in/out */
```

## Components

### Cards
```css
.card-primary   /* Base: medium radius, soft shadow */
.card-float     /* Elevated: deeper shadow */
```

### Buttons
```css
.btn-primary    /* Primary: dreamwave indigo */
.btn-secondary  /* Secondary: dreamwave violet */
.btn-accent     /* Highlight: dreamwave pink */
.btn-danger     /* Destructive: dreamwave error */
.btn-ghost      /* Tertiary: transparent */
```
*Note: All buttons use `border-radius: var(--radius-full)` (pill shape).*

### Inputs
```css
.input-primary  /* Standard: fully rounded */
```

### Layout
```css
.container-main    /* Main content (1200px) */
.container-narrow  /* Narrow content (800px) */
.section-primary   /* Major page sections */
```

## Usage Guidelines

### Do's
-   **Embrace rounded corners.** `--radius-full` for buttons, `--radius-medium` for cards.
-   Apply consistent spacing from scale (rhythm).
-   Use ethereal color palette intentionally, semantically.
-   Animate with natural timing, easing.
-   Layer shadows subtly for clean elevation.

### Don'ts
-   **Never use sharp corners (0 border-radius).**
-   Avoid gradients. Identity is solid, soft color.
-   Don't use `--dreamwave-error` for non-warnings/destructive actions.
-   Never use linear easing for animations.
-   Avoid cluttered layouts; whitespace guides user.

## Dark Mode

Light-to-dark swap: high-contrast, focused experience.

-   Background: deep, dark blue (`#1A1A2E`).
-   Text: soft, off-white (`rgba(255, 255, 255, 0.9)`).
-   Ethereal colors: unchanged, pop on dark.
-   Shadows: subtle glows or lighter surfaces for elevation.

## Accessibility

-   Primary color combos: WCAG AA contrast.
-   Focus states: highly visible (outlines/rings).
-   Animations: respect `prefers-reduced-motion`.
-   Touch targets: min 44x44px.
-   Text: scales with user-agent settings.

---

## 4. Directory Structure & File Organization

### Core Structure

```
src/
├── lib/                    # Reusable modules, utils
│   ├── components/         # Shared Svelte components
│   │   ├── ui/            # Design system components
│   │   └── *.svelte       # Feature components
│   ├── stores/            # Svelte stores
│   ├── types/             # TS type defs
│   ├── db.ts              # DB operations
│   ├── auth.ts            # Auth setup
│   ├── constants.ts       # App constants
│   └── utils.ts           # Utility functions
├── routes/                # SvelteKit routing
│   ├── +layout.svelte     # Root layout
│   ├── +page.server.ts    # Server page logic
│   ├── +page.svelte       # Page components
│   └── [dynamic]/         # Dynamic routes
└── (styles)/              # Global styles
```

### File Naming Conventions

-   **Components**: `PascalCase.svelte` (e.g., `ChatWindow.svelte`)
-   **Types**: `types.ts` or `*.d.ts`
-   **Tests**: `*.test.ts` (unit), `*.spec.ts` (e2e)

## 5. Coding Style & Conventions

### Naming Conventions

-   **Variables/Functions**: `snake_case`
-   **Classes/Components**: `PascalCase`
-   **Constants**: `UPPER_SNAKE_CASE`
-   **Database Fields**: Single/double letter (`t` text, `g` googleId, `u` username, `s` tenant)
-   **Types/Interfaces**: `PascalCase` (descriptive)

### TypeScript Standards

-   Strict null checks enabled.
-   Use SvelteKit generated types (`import type { PageData } from './$types'`).
-   Define all entities in `src/lib/types.ts`.
-   Prefer interfaces for object shapes.

## 6. Key Design & Implementation Patterns

### Server Load Pattern

Fetch initial page data from DB.

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

Handle form submissions, server-side processing.

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

Consistent DB operations with type isolation.

```typescript
// Always use type-aware queries
const users = await searchByPayload<User>({
	s: 'u', // Type identifier
	u: 'some_user' // Additional filters
});

// For single record retrieval
const user = await getById<User>(userId);

// For creating records
const newRecord = await upsertPoint({
	s: 'u',
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

Manage component lifecycle, reactivity.

```svelte
<script lang="ts">
	import { onMount } => 'svelte';
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

Consistent error handling, user feedback.

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
	import { toast } from '$lib/toast';

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

### Authentication Pattern (Lucia)

Protect routes, access user context.

```typescript
// Server-side auth requirement in a load function or action
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {requireAuth} from '$lib/auth'

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await requireAuth(locals);
	if (!user) {
		throw error(401, 'You must be logged in to access this page.');
	}
	// Use user for authenticated operations
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