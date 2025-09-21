<script lang="ts">
	import PostSearch from '$lib/components/PostSearch.svelte';
	import { page } from '$app/state';

	let { data } = $props();
	let q = $state('');
	let posts = $state<any[]>([]);
	let loading = $state(false);
</script>

<div class="mx-auto max-w-4xl p-4 md:p-8">
	<div class="mb-6">
		<a href={`/posts/${$page.params.i}`} class="inline-flex items-center font-medium text-[var(--text-accent)] transition-colors hover:text-[var(--accent-primary)]">&larr; back to post</a>
	</div>

	<h1 class="mb-4 text-2xl font-bold text-[var(--accent-primary)]">subposts of {data.parent?.t}</h1>

	<PostSearch bind:q bind:posts bind:loading filter={{ f: $page.params.i }} />
</div>

