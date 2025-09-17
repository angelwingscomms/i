ALWAYS CODE AS CONCISELY AS POSSIBLE

For ALL styling, always use the design system defined in src/app.css. ALWAYS use tailwind ONLY. ALWAYS use custom utility classes defined in src/app.css. NEVER use tailwind utility classes directly on elements. ONLY create new custom utility classes if absolutely necessary. Always think about styling deeply, like you're Steve Jobs and Jony Ive. Like you have years of expert experience creating beautiful UI and design. Like you work at a high brow creative studio with high brow clients like Apple.

Codebase conventions:

- naming: always snake_case for vars/functions; db payload keys are 1-2 letters (e.g., s,t,u,i,a,g,d)
- types: define in src/lib/types; prefer minimal, optional fields; export interfaces
- ids: use uuid v7; i is the primary id everywhere
- vars: avoid creating variables for single-use expressions, values, or simple property accesses; pass them directly into functions/expressions when possible

SvelteKit patterns:

- data loading: always fetch all page data in +page.server.ts load
- endpoints: always use /[resource_tenant_id]+server.ts API routes for client-server data flow
- reactivity: always use `$derived` or `$effect` for reactive statements; never use `$:`.

UI:

- toasts: use src/lib/util/toast.ts
- avoid inline styles and style blocks; only use design system utilities

- Always write really simple code in a really simple way: code that does exactly what it needs to, without too much code or doing too much, but is really simple, elegant, beautiful, and completely does the job satisfyingly. For whatever you're doing, always ask yourself: do we really need this? Is this really helping the user? Is this really necessary for the software? Is this really adding value to the software, or is this something the software can conveniently and satisfyingly do without?

- all db data stored in single Qdrant collection 'i', `s` payload field isolates data types (e.g., 'u' user, 'se' session, 'm' message, 'n' notif sub)
- always use single/double letter field names for db (`i` id, `t` tag/text, `u` user id, `d` desc/date, `a` age/created, `g` gender, `l` last/lat, `n` lon, `w` whatsapp, `c` compact map, `x` compact array)
- always use `snake_case` for variable and function names; files and routes use SvelteKit defaults
- define all types in `src/lib/types`; export interfaces; keep fields minimal/optional
- always get all data for a page in `+page.server.ts` load; bubble user via `+layout.server.ts`
- qdrant: single collection `i`; vectors len 3072; include `s` in filters; use `format_filter`; use `scroll`/`search_by_payload` for payload queries; `search_by_vector` for semantic
- toasts: use `src/lib/util/toast.ts`; avoid inline styles; only design-system utilities
- in server files, use `error(status, message)` from `@sveltejs/kit` or return `json(..., { status })` in APIs
- auth: user in `locals.user { i, t }`; sessions via httpOnly cookie; refresh activity on requests
- always include `s` field in db queries/filters; omit null/undefined/'' in filters
- always validate input client-side and server-side; provide clear messages
- embeddings: use `src/lib/util/embed.ts`;
- all constants in `src/lib/constants.ts`;
- for editing points, `always use qdrant.setpayload`;

ALWAYS CODE AS CONCISELY AS POSSIBLE

- always look at the reference files to see how things are done. The reference files are:

  * \`src/lib/components/Chat.svelte\`

  * \`src/routes/+page.svelte\` (homepage)

  * \`src/routes/r/+page.server.ts\`

  * \`src/routes/r/+server.ts\`

  * \`src/routes/r/+page.svelte\`

  * all pages under \`src/routes/r/[i]/\` (r-detail pages)

  * \`src/lib/types/index.ts\`

  * \`src/lib/db/index.ts\`

These serve as the practical examples the agent should follow.
