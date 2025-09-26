- Before creating any file, check how it's done in ./examples

## Code Style

- Naming: always snake_case for vars/functions; db payload, type defs, request JSON and page load return value keys always single letters.
- Styling: Tailwind utilities only; no inline styles/style blocks
- DB/Qdrant: Multi-tenancy, single collection 'i';  tenant-id on payload field `s`
- Conciseness: no vars for single-use; code minimally
- when styling, always use vars in src/styles/_variables.css. always use Tailwind only. DON'T USE STYLEBLOCKS OR INLINE STYLES.
- never start the dev server
- always use all lowercase for all UI text