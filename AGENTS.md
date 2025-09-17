# CRUSH.md

## Code Style

- Naming: snake_case for vars/functions; db payload keys single letters (e.g., i=id, t=tag/text, u=user, d=desc/date, a=age/created, g=gender, l=lat/lon)
- Types: Define in src/lib/types/index.ts; minimal/optional fields; export interfaces with comments (e.g., export interface Room { n: string; // room name })
- Reactivity: Use $derived/$effect; avoid `$:`
- Data Loading: Fetch all in +page.server.ts load; return single-letter keys (e.g., { r: room })
- DB/Qdrant: Single collection 'i'; filter by 's' (type); use scroll/search_by_payload; embeddings via src/lib/util/embed.ts
- Auth: locals.user { i, t }; httpOnly cookies; 403 errors for unauthorized (e.g., if (r.u !== locals.user.i) throw error(403))
- in page.server.ts, if not user, redirect(302, '/login)
- in page.svelte, get page data and current user from page.data.user. expect page.data.user to already have the current user and use to check authorization
- Errors: error(status, message) from @sveltejs/kit or json(..., { status })
- Toasts: src/lib/util/toast.ts
- Security: Validate inputs client/server; no secrets in code; use qdrant.setpayload for edits
- Conciseness: Avoid vars for single-use; code minimally; reference patterns in src/lib/components/Chat.svelte, src/routes/+page.svelte, etc.
- event handlers without have colon e.g `onclick` not `on:click`
- when styling, always look at src/styles/\_variables.css. ALWAYS use Tailwind ONLY. DON'T USE STYLEBLOCKS OR INLINE STYLES.
- ALWAYS run `npm run format` before and after editing files
- except `npm run format`, never run any npm commands unless asked to
