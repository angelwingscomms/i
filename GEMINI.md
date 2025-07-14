# Codebase Guide

This document serves as the definitive guide for understanding and contributing to the codebase. It provides patterns, conventions, and architectural decisions that ensure consistency across the project.

## 1. Project Specifics: "i"

This section details the unique aspects of the "i" application. The rest of this guide provides general patterns and conventions applicable to any project built with this stack.

### Core Concept

"i" is an application designed to create meaningful connections between users. Its primary feature is a matching system that pairs users for one-on-one audio/video chats based on shared interests and personality traits, rather than random chance.

### Key Features & Data Flow

1.  **User Onboarding & Profile**:
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
- **Authentication**: Lucia pattern
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

## 3. Dreamwave Design System
*A design language for dreamy, soft, and connected experiences.*

## Philosophy

> "Good design is felt, not just seen. It’s the gentle flow that connects an idea to a person."

This design system is built on the principle that digital interfaces should be soft, approachable, and calming. We prioritize clarity and serenity, using ethereal color and soft, rounded forms to create an experience that is both intuitive and delightful.

### Core Principles

1.  **Approachably Rounded** - Every element, from buttons to containers, uses a full radius to feel friendly and modern.
2.  **Ethereal, Solid Color** - We use a curated palette of solid colors. No gradients.
3.  **Soft Shadows** - Depth is created with subtle, clean shadows that make elements feel light.
4.  **Generous Whitespace** - Content is given ample space to breathe, ensuring focus and reducing clutter.
5.  **Gentle Animations** - Movements are responsive and smooth, making interactions feel natural.

## Color Palette

Our colors are soft and expressive, chosen to create a calm and engaging user experience.

### Primary Colors

```css
/* CSS Custom Properties */
--dreamwave-violet: #B637FA;
--dreamwave-pink: #FA378B;
--dreamwave-magenta: #F737FA;
--dreamwave-indigo: #7837FA;
--dreamwave-error: #FA3A2F;      /* Reserved for errors/danger */
--dreamwave-light-mauve: #F889FA;

/* Foundational Colors (assumed for a complete system) */
--background-primary: #FFFFFF;
--text-primary: #1A1A2E;     /* A very dark, near-black for readability */
--text-on-color: #FFFFFF;    /* Text used on top of vibrant backgrounds */
```

### Semantic Mapping

- **Primary Actions**: Dreamwave Indigo (`#7837FA`) - Calm, stable, and inviting.
- **Secondary Actions**: Dreamwave Violet (`#B637FA`) - Inviting and gentle.
- **Accent & Highlight**: Dreamwave Pink (`#FA378B`) - Draws attention and adds a touch of warmth.
- **Critical/Danger**: Dreamwave Error (`#FA3A2F`) - Exclusively for warnings, errors, and destructive actions.
- **Text**: Text Primary (`#1A1A2E`) - High-contrast and easy to read.
- **Subtle Backgrounds**: Dreamwave Light Mauve (`#F889FA`) - For gentle highlights or disabled states.

## Typography

### Scale
```css
--text-whisper: 0.75rem    /* 12px - Subtle annotations */
--text-breath: 0.875rem    /* 14px - Supporting text */
--text-flow: 1rem          /* 16px - Body text */
--text-wave: 1.125rem      /* 18px - Emphasized text */
--text-tide: 1.25rem       /* 20px - Small headings */
--text-horizon: 1.5rem     /* 24px - Section headings */
--text-sky: 2rem           /* 32px - Page headings */
--text-cosmos: 3rem        /* 48px - Hero text */
```

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
```

## Spacing System

Our spacing follows a consistent and predictable 4px-based scale.

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

Soft, rounded corners are fundamental to our visual identity.

```css
--radius-medium: 0.75rem;    /* 12px - For cards and larger containers */
--radius-large: 1.25rem;     /* 20px - For modals and page-level containers */
--radius-full: 9999px;       /* For pill-shaped buttons and tags */
```

## Shadows

Shadows that are clean and soft, providing depth without heaviness.

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
--timing-breath: 150ms     /* Quick responses */
--timing-heartbeat: 300ms  /* Standard interactions */
--timing-wave: 500ms       /* Gentle transitions */
--timing-tide: 800ms       /* Thoughtful changes */
```

### Easing
```css
--ease-breath: cubic-bezier(0.4, 0, 0.2, 1)      /* Natural acceleration */
--ease-float: cubic-bezier(0.25, 0.46, 0.45, 0.94) /* Gentle floating */
--ease-dream: cubic-bezier(0.23, 1, 0.32, 1)     /* Smooth in/out */
```

## Components

### Cards
```css
.card-primary   /* Base cards with a medium radius and soft shadow */
.card-float     /* Elevated cards with a deeper shadow */
```

### Buttons
```css
.btn-primary    /* Primary actions - dreamwave indigo */
.btn-secondary  /* Secondary actions - dreamwave violet */
.btn-accent     /* Highlight actions - dreamwave pink */
.btn-danger     /* Destructive actions - dreamwave error */
.btn-ghost      /* Tertiary actions - transparent background */
```
*Note: All buttons use `border-radius: var(--radius-full)` to achieve a pill shape.*

### Inputs
```css
.input-primary  /* Standard form inputs, fully rounded */
```

### Layout
```css
.container-main    /* Main content container (1200px) */
.container-narrow  /* Narrow content container (800px) */
.section-primary   /* Major page sections */
```

## Usage Guidelines

### Do's
- **Embrace rounded corners.** Use `--radius-full` for buttons and `--radius-medium` for cards.
- Apply consistent spacing from our scale to create rhythm.
- Use our ethereal color palette intentionally and semantically.
- Animate with natural timing and easing.
- Layer shadows subtly to create a clean sense of elevation.

### Don'ts
- **Never use sharp corners (0 border-radius).**
- Avoid gradients. Our identity is in solid, soft color.
- Don't use the `--dreamwave-error` color for anything other than warnings or destructive actions.
- Never use linear easing for animations.
- Avoid cluttered layouts; let whitespace guide the user's eye.

## Dark Mode

Dark mode in the Dreamwave system swaps light for dark, creating a high-contrast, focused experience.

- Background becomes a deep, dark blue (`#1A1A2E`).
- Text becomes a soft, off-white (`rgba(255, 255, 255, 0.9)`).
- Ethereal colors remain the same, popping against the dark background.
- Shadows are replaced by subtle glows or lighter surface colors to imply elevation.

## Accessibility

- All primary color combinations meet WCAG AA contrast standards.
- Focus states are highly visible, using distinct outlines or rings.
- Animations respect `prefers-reduced-motion`.
- Touch targets have a minimum size of 44x44px.
- Text is designed to scale appropriately with user-agent settings.

---

*"In the end, we believe that design is about creating a feeling. Our goal is to make every interaction feel responsive, joyful, and effortlessly simple."*

## 4. Directory Structure & File Organization

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
│   ├── auth.ts            # Authentication setup
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

## 5. Coding Style & Conventions

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

## 6. Key Design & Implementation Patterns

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

## 7. Development Workflow

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

## 8. Architecture Decisions

### Database Design

- **Single Collection**: All primary data resides in the Qdrant collection `'i'` for operational simplicity.
- **Type Isolation**: Using the `s` payload field to distinguish between different types of data (e.g., `'usr'`).
- **Short Field Names**: Optimized for storage and reduced payload size (`u` for username, `t` for text, `g` for googleId).
- **UUID v7**: Time-ordered UUIDs are used for point IDs for better indexing performance and natural sorting by creation time.

### Authentication Strategy

- Follows Lucia pattern. Configuration is centralized in `src/lib/auth.ts`. All session validation occurs on the server.

### State Management

- **Server State**: Handled primarily by SvelteKit's `load` functions, ensuring data is fetched server-side before page render.
- **Client State**: Limited to UI-specific concerns (e.g., auth status, toast notifications) and managed with Svelte stores.
- **Form State**: Handled via native HTML forms and SvelteKit Actions, embracing progressive enhancement.

### Performance Considerations

- **Lazy Loading**: SvelteKit's file-based routing naturally lazy-loads code for each page.
- **Efficient Queries**: Database queries are designed to be specific, leveraging Qdrant's filtering capabilities alongside vector search.
- **Minimal JavaScript**: SSR-first approach with selective client-side hydration.
- **Caching**: Standard browser caching for static assets is enabled by default.

## 9. Common Pitfalls to Avoid

1.  **Database Queries**: Always include the `s` field in queries to ensure you are targeting the correct data type.
2.  **Authentication**: Never rely on client-side checks for security. All sensitive operations must be validated on the server using the `locals.auth` object.
3.  **Form Validation**: Validate all user input on both the client (for UX) and the server (for security).
4.  **Error Handling**: Always provide user-friendly error messages via `fail` in actions or the `toast` store for client-side operations.
5.  **Type Safety**: Leverage SvelteKit's generated types (`./$types`) and define shared interfaces in `src/lib/types.ts`.
6.  **Styling**: Use the established design system (e.g., Tailwind classes) instead of hardcoding values or one-off styles.
7.  **Testing**: Ensure tests cover both the "happy path" and potential error scenarios or edge cases.

This guide should be updated as the codebase evolves to maintain accuracy and usefulness for all contributors.