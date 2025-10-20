<script lang="ts">
	import PostSearch from '$lib/components/PostSearch.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { user, targetUser } = data;
</script>

<svelte:head>
	<title>posts by {targetUser.t} - apexlinks</title>
</svelte:head>

<div class="container mx-auto max-w-4xl p-4">
	<div class="mb-6">
		<h1
			class="text-3xl font-bold text-[var(--accent-primary)]"
		>
			Posts by {targetUser.t}
		</h1>
	</div>
	<PostSearch
		filter={{ u: targetUser.i }}
		showPrivateFilter={user?.i === targetUser.i}
	/>
</div>
