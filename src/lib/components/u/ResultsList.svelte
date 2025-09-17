<script lang="ts">
	import UserCard from './UserCard.svelte';
	type Result = {
		i: string;
		t: string;
		a?: number;
		g?: number;
		av?: string;
		score?: number;
	};

	let { results } = $props<{ results: Result[] }>();
</script>

<div class="space-y-3">
	{#each results as u (u.i)}
		<UserCard {u} />
	{/each}
</div>
