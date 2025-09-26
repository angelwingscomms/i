perform the following edits to AGENTS.md:

```let @AGENTS.md also, in the same examples, demonstrate resource having and allowing user to add/remove multiple images
to it, and also how to dislay those images in resource search results and resource detail page, look closely at how
images are done for @src/routes/i/ in the codebase. also create lib/components/resource/[ResourceSearch.svelte,
index.ts, test.ts] in the example: the component will follow the UI patterns in @src/routes/i/+page.server.ts, index.ts
exports the component and test.ts tests the component (search the net and look at Svelte/SvelteKit's docs for component
testing) also look at Svelte/SvelteKit's entire docs on testing and update the examples accordingly. also create in the
examples src/lib/types/resource.ts - n: name, b: body, p: string[] //images, u: user id, d: date, a: about. sonsult all
the types files to get an idea.

let src/routes/resource_name/[i]/edit/+page.server.ts example also check if r.s === resource_tenant_id, if not error(400, 'this resource is not a {resource type}'). let src/routes/resource_name/[i]/+server.ts delete route use get() to get the resource and check if r.s === resource_tenant_id, if not error(400, 'this resource is not a {resource type}'). also let it just return new Response() on success. same for put route. let src/routes/resource_name/+page.server.ts use get() to get the resource. let src/routes/resource_name/+page.server.ts search for the resources and return them, like src/routes/posts/+page.server.ts and src/routes/i/+page.server.ts```

start by creating a detailed plan for doing these edits in xplan.md, then work on each plan item one by one