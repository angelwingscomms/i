# CRUSH.md

## Commands

- Dev: npm run dev (user must start manually; never auto-run)
- Build: npm run build
- Preview: npm run preview
- Lint: npm run lint (prettier --check . && eslint .)
- Format: npm run format (prettier --write .)
- Typecheck: npm run check (svelte-kit sync && svelte-check --tsconfig ./tsconfig.json)
- Test Unit: npm run test:unit (vitest)
- Single Unit Test: npm run test:unit -- path/to/file.spec.ts --run
- Test E2E: npm run test:e2e (playwright test)
- Storybook: npm run storybook

## Code Style

- Naming: snake_case for vars/functions; db payload keys 1-2 letters (e.g., i=id, t=tag/text, u=user, d=desc/date, a=age/created, g=gender, l=lat/lon)
- Types: Define in src/lib/types/index.ts; minimal/optional fields; export interfaces with comments (e.g., export interface Room { n: string; // room name })
- IDs: Use uuid v7; 'i' as primary id everywhere
- Imports: SvelteKit patterns; check existing libs (e.g., @sveltejs/kit, tailwind)
- Formatting: Prettier + ESLint (typescript-eslint, svelte, storybook); strict TS (tsconfig.json)
- Styling: Tailwind utilities only (src/app.css); no inline styles/style blocks
- Reactivity: Use $derived/$effect; avoid $:
- Data Loading: Fetch all in +page.server.ts load; return single-letter keys (e.g., { r: room })
- DB/Qdrant: Single collection 'i'; filter by 's' (type); use scroll/search_by_payload; embeddings via src/lib/util/embed.ts
- Auth: locals.user { i, t }; httpOnly cookies; 403 errors for unauthorized (e.g., if (r.u !== locals.user.i) throw error(403))
- Errors: error(status, message) from @sveltejs/kit or json(..., { status })
- Toasts: src/lib/util/toast.ts
- Security: Validate inputs client/server; no secrets in code; use qdrant.setpayload for edits
- Conciseness: Avoid vars for single-use; code minimally; reference patterns in src/lib/components/Chat.svelte, src/routes/+page.svelte, etc.

## Cursor Rules

- Never run npm run dev/build/start unless user explicitly instructs (avoids interfering with local dev server).
