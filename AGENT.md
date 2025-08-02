For ALL styling, always use the design system defined in src/app.css. ALWAYS use tailwind ONLY. ALWAYS use custom utility classes defined in src/app.css. NEVER use tailwind utility classes directly on elements. ONLY create new custom utility classes if absolutely necessary

start every task by craeting a telegraphic speech list that details the task into many small micro-tasks, then do each micro-task.

- all db data stored in single Qdrant collection `'i'`, `s` payload field isolates data types (e.g., 'u` for user id).
- always use single/double letter field names for db (`t` user tag, `u` user id, `s` tenant id)
- always use `snake_case` for variable/function names
- define all types in `src/lib/types`.
- for db stuff, always use the db helper functions in src/lib/db/index.ts
- always use api routes to get data from client to server, e.g routes/search/+server.ts
- always use wait: true for qdrant write ops
- always use svelte fade transition in UI when you want
- always use `toasts` src/lib/toast.ts for adding and showing toast notifications
- in server files(e.g endpoint or page load), use error from '@sveltejs/kit': throw error(404, 'Resource not found')
- get logged in user on server from locals.user
- always write 100% coverage unit and e2e tests for all features implemented. always unit tests all features after adding
- always include `s` field in db search queries for correct data type.
- always do sensitive ops server side
- always validate input client-side and server-side
- always provide user-friendly errors
- always Cover "happy path", error scenarios/edge cases.

Guide update as codebase evolves.