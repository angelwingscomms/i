- always search the net when it might help
- always follow the patterns in the example files perfectly

## Example Files

- src/lib/components/resource/ResourceCard.svelte
- src/lib/components/resource/ResourceSearch.svelte
- src/lib/components/resource/index.ts
- src/lib/components/resource/test.ts
- src/lib/types/resource.ts
- src/lib/util/resource/utility_name/index.ts
- src/lib/util/resource/utility_name/test.ts
- src/routes/resource_name/[i]/edit/+page.server.ts
- src/routes/resource_name/[i]/edit/+page.svelte
- src/routes/resource_name/[i]/+page.server.ts
- src/routes/resource_name/[i]/+server.ts
- src/routes/resource_name/create/+page.server.ts
- src/routes/resource_name/+page.server.ts
- src/Component.svelte
- src/page.svelte
- src/util.ts

## Code Style

- Naming: always snake_case for vars/functions; db payload, type defs, request JSON and page load return value keys always single letters.
- Styling: Tailwind utilities only; no inline styles/style blocks
- DB/Qdrant: Multi-tenancy, single collection 'i'; tenant-id on payload field `s`
- Conciseness: no vars for single-use; code minimally
- when styling, always use vars in src/styles/\_variables.css. always use Tailwind only. DON'T USE STYLEBLOCKS OR INLINE STYLES.
- never start the dev server
- always use all lowercase for all UI text
