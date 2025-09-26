- Before creating any file, check how it's done in ./examples

## Code Style

- Naming: always snake_case for vars/functions; db payload, type defs, request JSON and page load return value keys always single letters.
- Styling: Tailwind utilities only; no inline styles/style blocks
- DB/Qdrant: Multi-tenancy, single collection 'i';  's' (type); use scroll/search_by_payload; embeddings via src/lib/util/embed.ts
- Conciseness: no vars for single-use; code minimally
- when styling, always look at src/styles/\_variables.css. ALWAYS use Tailwind ONLY. DON'T USE STYLEBLOCKS OR INLINE STYLES.
- never start the dev server
- always use all lowercase for all UI text

# multi variable declaration

```svelte
let {data} = $props(), post: Post = data.p;
```

# genai

- always use gemini-2.5-flash for all text genai

page.svelte

- use svelte:window to add event handlers to window, e.g <svelte:window onkeydown>
- always import {page} from '$app/state', cuz Svelte5
