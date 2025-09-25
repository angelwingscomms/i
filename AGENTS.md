- always use exasearch to check the docs for anything before starting, especially SvelteKit
- Svelte 5: Use $state for top-level variables or objects; mutate properties of $state objects for reactivity. Do not use $state for property assignments like obj.prop = $state(...); instead, initialize the object with $state and set properties directly, or use a separate $state variable for the property. For arrays like z, use let z = $state(data.z || []); and mutate z.push().

## Code Style

- always use axios and try/catch for http requests: try {axios.method...} catch (e) {console.error(e.response?.data || e.message)}
- Naming: snake_case for vars/functions; db payload keys single letters (e.g., i=id, t=tag/text, u=user, d=desc/date, a=age/created, g=gender, l=lat/lon)
- Types: Define in src/lib/types/index.ts; single character fields; export interfaces with comments (e.g., export interface Room { n: string; // room name })
- Styling: Tailwind utilities only; no inline styles/style blocks
- Data Loading: Fetch all in +page.server.ts load; return single-letter keys (e.g., { r: room })
- DB/Qdrant: Single collection 'i'; filter by 's' (type); use scroll/search_by_payload; embeddings via src/lib/util/embed.ts
- Auth: 403 errors for doesn't own resource, 401 for not logged in
- in page.svelte, get page data and current user from page.data.user. expect page.data.user to already have the current user { i, t } and use to check authorization
- server Errors: error(status, message) from @sveltejs/kit or json(..., { status })
- Toasts: src/lib/util/toast.ts
- Security: Always use qdrant.setpayload for edits
- Conciseness: Avoid vars for single-use; code minimally
- Never run npm run dev/build/start unless user explicitly instructs (avoids interfering with local dev server).
- event handlers without have colon e.g `onclick` not `on:click`
- when styling, always look at src/styles/\_variables.css. ALWAYS use Tailwind ONLY. DON'T USE STYLEBLOCKS OR INLINE STYLES.
- never run any npm commands unless asked to
- always send data to server in JSON or formdata w/ single character fields
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

## Examples for ResourceName

### src/page.svelte

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import { toast } from '$lib/util/toast';
	let { data } = $props(),
		item: Item = data.i;

	function handle_click() {
		toast.info('enter key action taken');
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Enter') handle_click();
	}}
/>

{#if page.data.user.i === item.u}
	<div class="bg-white p-4 text-black">
		<p>{item.t}</p>
		<button onclick={handle_click}>update</button>
	</div>
{/if}
```

### src/Component.svelte

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import axios from 'axios';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import type { Item, User } from '$lib/types';

	let {
		item,
		onclick,
		showDetails = false,
		loading = $bindable(false)
	} = $props<{
		item: Item;
		onclick: () => void;
		showDetails?: boolean;
		loading?: boolean;
	}>();

	let message = $state('');
	let items = $state<Item[]>([]);
	let inputEl: HTMLInputElement | null = null;

	$effect(() => {
		if (showDetails && items.length === 0) {
			load_related_items();
		}
	});

	const displayName = $derived.by(
		() => item.t || 'unnamed item'
	);

	const isOwner = $derived(
		page.data.user?.i === item.u
	);

	async function load_related_items() {
		try {
			const { data } = await axios.get(
				`/api/items/${item.i}/related`
			);
			items = data;
		} catch (e) {
			console.error(e.response?.data || e.message);
		}
	}

	async function send_update() {
		loading = true;
		try {
			await axios.post('/api/update', {
				i: item.i,
				t: item.t,
				m: message
			});
			message = '';
			onclick();
		} catch (e) {
			console.error(e.response?.data || e.message);
		} finally {
			loading = false;
		}
	}

	function handle_keydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send_update();
		}
	}

	onMount(() => {
		inputEl?.focus();
	});
</script>

<div class="component-container">
	<div
		class="item-header flex items-center justify-between border-b p-4"
	>
		<h3 class="text-lg font-bold">{displayName}</h3>
		{#if isOwner}
			<button
				onclick={send_update}
				disabled={loading}
				class="btn-primary"
			>
				{#if loading}
					<i class="fas fa-spinner fa-spin"></i>
				{:else}
					update
				{/if}
			</button>
		{/if}
	</div>

	{#if showDetails}
		<div class="item-details p-4" in:fade>
			<p class="mb-4 text-gray-600">
				{item.d || 'no description'}
			</p>

			{#if items.length > 0}
				<div class="related-items mb-4">
					<h4 class="text-md mb-2 font-semibold">
						related items
					</h4>
					<div
						class="grid grid-cols-1 gap-2 md:grid-cols-2"
					>
						{#each items as related_item (related_item.i)}
							<div
								class="related-item rounded border p-2"
								in:fade
							>
								{related_item.t}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if isOwner}
				<div class="update-form">
					<textarea
						bind:this={inputEl}
						bind:value={message}
						onkeydown={handle_keydown}
						placeholder="add a message..."
						rows="3"
						class="w-full resize-none rounded border p-2"
					></textarea>
				</div>
			{/if}
		</div>
	{/if}
</div>
```

### src/util.ts

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Item } from '$lib/types';

const genai = new GoogleGenerativeAI(
	process.env.GEMINI_API_KEY!
);

export async function generate_description(
	t: string
): Promise<string> {
	const model = genai.getGenerativeModel({
		model: 'gemini-2.5-flash'
	});
	const result = await model.generateContent(
		`describe: ${t}`
	);
	return result.response.text();
}

export function format_date(a: number): string {
	return new Date(a).toLocaleDateString();
}
```

### src/routes/resource_name/+page.server.ts

```typescript
import { error } from '@sveltejs/kit';
import { qdrant } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	locals,
	params
}) => {
	if (!locals.user) error(401, 'not logged in');
	const r = await qdrant.scroll('i', {
		filter: { s: 'room', i: params.id }
	});
	if (
		!r.points[0] ||
		r.points[0].payload.s !== 'room'
	)
		error(400, 'this resource is not a room');
	if (r.points[0].payload.u !== locals.user.i)
		error(403, 'not authorized');
	return { r: r.points[0].payload };
};
```

### src/routes/resource_name/[i]/+page.server.ts

```typescript
import { error } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	if (!params.i) error(400, 'missing resource id');
	const r = await get(params.i);
	if (!r) error(404, 'resource not found');
	if (r.s !== 'r')
		error(400, 'this resource is not a resource');
	if (r.u !== locals.user?.i)
		error(403, 'not authorized');
	return { r: { ...r, i: params.i } };
};
```

### src/routes/resource_name/[i]/+server.ts

```typescript
import { json, error } from '@sveltejs/kit';
import { qdrant } from '$lib/db';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({
	request,
	params,
	locals
}) => {
	if (!locals.user) error(401, 'not logged in');
	try {
		const { t, d } = await request.json();
		await qdrant.setpayload('i', {
			i: params.i,
			t,
			d
		});
		return json({ success: true });
	} catch (e) {
		console.error(e.response?.data || e.message);
		error(500, 'server error');
	}
};

export const DELETE: RequestHandler = async ({
	params,
	locals
}) => {
	if (!locals.user) error(401, 'not logged in');
	const r = await qdrant.scroll('i', {
		filter: { i: params.i }
	});
	if (
		!r.points[0] ||
		r.points[0].payload.u !== locals.user.i
	)
		error(403, 'not authorized');
	await qdrant.delete('i', [params.i]);
	return json({ success: true });
};
```

### src/routes/resource_name/[i]/edit/+page.server.ts

```typescript
import { error, redirect } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	if (!locals.user) redirect(302, '/login');
	const r = await get(params.i);
	if (!r) error(404, 'resource not found');
	if (r.u !== locals.user.i)
		error(403, 'not authorized');
	return { r: { ...r, i: params.i } };
};
```

### src/routes/resource_name/[i]/edit/+page.svelte

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import axios from 'axios';
	import { toast } from '$lib/util/toast';
	let { data } = $props(),
		r: ResourceName = data.r;

	async function update_resource() {
		try {
			await axios.put(`/resource_name/${r.i}`, {
				t: r.t,
				d: r.d
			});
			toast('resource updated');
		} catch (e) {
			console.error(e.response?.data || e.message);
		}
	}
</script>

{#if page.data.user.i === r.u}
	<form onsubmit={update_resource}>
		<input bind:value={r.t} placeholder="title" />
		<textarea
			bind:value={r.d}
			placeholder="description"
		></textarea>
		<button type="submit">update</button>
	</form>
{/if}
```

### src/routes/resource_name/create/+page.server.ts
```typescript
import { create } from '$lib/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	locals
}) => {
	if (!locals.user) redirect(302, '/login');
	const i = await create({
		s: 'r',
		u: locals.user.i,
		d: Date.now()
	});
	redirect(302, `/resource_name/${i}/edit`);
};
```

### src/lib/util/utility_name/index.ts

```typescript
export function utility_name(param: string): string {
	return `processed ${param}`;
}
```

### src/lib/util/utility_name/test.ts

```typescript
import { utility_name } from '../index';

describe('utility_name', () => {
	it('processes input', () => {
		expect(utility_name('test')).toBe(
			'processed test'
		);
	});
});
```
