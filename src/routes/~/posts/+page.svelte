<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { toast } from '$lib/util/toast.svelte.js';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import type { Post } from '$lib/types/index';
	import Button from '$lib/components/Button.svelte';

	import PostSearch from '$lib/components/PostSearch.svelte';

	let { data } = $props();
	// state
	let q = $state('');
	let posts = $state(data.p || []);
	let creating = $state(false);

	let loading = $state(false);
	let searched = $state(false);

	// minimal fetch wrappers
	async function search() {
		loading = true;
		searched = true;
		try {
			({ data: posts } = await axios.post(
				'/posts/search',
				{ q }
			));
		} catch (e) {
			toast.error('Search failed. Try again.');
		} finally {
			loading = false;
		}
	}

	async function create() {
		creating = true; // Set creating to true
		try {
			const res = await axios.post('/~/posts');
			console.log('create res', res);
			if (res.status === 401) {
				toast.error(
					'you must be logged in to create a post'
				);
				return;
			}
			if (res.statusText !== 'OK')
				throw new Error('create failed');
			goto(`/~/posts/create`);
		} catch (e) {
			toast.error('Failed to create post');
		} finally {
			creating = false; // Reset creating in finally block
		}
	}

	function on_key(e: KeyboardEvent) {
		if (e.key === 'Enter') search();
	}

	onMount(() => {
		// no-op init
	});
</script>

<div class="page pad">
	<div class="row space-between v-center mb-md">
		<h1 class="title">posts</h1>
		<Button
			text="create post"
			icon={creating ? 'fa-spinner fa-spin' : ''}
			href="/~/posts/create"
			wide={true}
		/>
	</div>

	<PostSearch
		bind:q
		bind:posts
		bind:loading
		onSearch={() => (searched = true)}
	/>
</div>

<style>
	/* Use custom utility classes defined in app.css (no raw Tailwind) */
	.page {
		max-width: 720px;
		margin: 0 auto;
	}
	.pad {
		padding: 16px;
	}
	.row {
		display: flex;
		gap: 8px;
	}
	.space-between {
		justify-content: space-between;
	}
	.v-center {
		align-items: center;
	}
	.title {
		font-size: 22px;
		font-weight: 700;
	}
	.subtitle {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 8px;
	}
	.card {
		background: transparent;
		border: 1px solid var(--color-theme-6);
		border-radius: 12px;
		padding: 12px;
	}
	.gap {
		display: grid;
		gap: 8px;
	}
	/* reserved for future inputs */
	.btn {
		background: var(--btn);
		color: var(--btn-text);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 8px 12px;
		font-weight: 600;
		cursor: pointer;
	}
	.btn.ghost {
		background: transparent;
		color: var(--text);
	}
	.btn-compact {
		width: fit-content;
	}
	.btn-wide {
		padding-left: 24px;
		padding-right: 24px;
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 12px 0 0;
		display: grid;
		gap: 8px;
	}
	.item {
		border-left: 1px solid var(--color-theme-6);
		border-bottom: 1px solid var(--color-theme-6);
		border-radius: 0 0 0 10px;
		background: transparent;
	}
	.link {
		color: var(--link);
		text-decoration: none;
		font-weight: 600;
		display: block;
		padding: 10px 12px;
		width: 100%;
		height: 100%;
	}
	.muted {
		color: var(--muted);
		padding: 8px 0;
	}

	.modal_backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(10px);
	}

	.search-input-group {
		display: flex;
		align-items: center;
		gap: 8px; /* Adjust gap as needed */
	}

	.expand {
		flex-grow: 1; /* Allows the input to take up available space */
	}
</style>
