<script lang="ts">
	import PostSearch from '$lib/components/PostSearch.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { user, targetUser } = data;
</script>

<svelte:head>
	<title>Posts by {targetUser.t} - Apexlinks</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-4xl">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-[var(--accent-primary)]">Posts by {targetUser.t}</h1>
	</div>
	<PostSearch
		filter={{ u: targetUser.i }}
		showPrivateFilter={user?.i === targetUser.i}
	/>
</div>