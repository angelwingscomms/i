<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import axios from 'axios';

	let { data } = $props();
	let resumes = $state(data.e || []);

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString();
	}
</script>

<div class="mx-auto max-w-2xl p-4">
	<h1 class="mb-4 text-2xl font-bold">My Resumes</h1>
	<Button
		text="Create Resume"
		onclick={async () => {
			const { data } =
				await axios.post('/api/resume');
			goto(`/resume/${data.i}/edit`);
		}}
	/>
	{#if resumes.length > 0}
		<ul class="space-y-4">
			{#each resumes as r (r.i)}
				<li
					class="rounded-lg border border-gray-200 p-4"
				>
					<a
						href={`/resume/${r.i}`}
						class="block rounded p-2 hover:bg-gray-50"
					>
						<div class="font-semibold">
							{formatDate(r.d || 0)}
						</div>
						{#if r.h}
							<div
								class="line-clamp-3 text-sm text-gray-600"
							>
								{r.h
									.replace(/<[^>]*>/g, '')
									.substring(0, 100)}...
							</div>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="mb-4 text-gray-500">No resumes yet.</p>
	{/if}
</div>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
