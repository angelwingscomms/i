<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { toast } from '$lib/util/toast.svelte';
	import axios from 'axios';

	let { data } = $props();
	let resumes = $state(data.e || []);
	let user = $state(data.user);
	let targetUserId = $state(data.targetUserId);
	let creating = $state(false);

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString();
	}
</script>

<div
	class="mx-auto flex max-w-2xl flex-col gap-y-5 p-4"
>
	<h1 class="text-2xl font-bold">
		{targetUserId}'s Resumes
	</h1>
	{#if targetUserId === user?.i}
		<Button
			text="Create Resume"
			loading={creating}
			onclick={async () => {
				creating = true;
				try {
					const { data } =
						await axios.post('/resume');
					goto(`/resume/${data}/edit`);
				} catch (e) {
					toast.error('Failed to create resume');
				} finally {
					creating = false;
				}
			}}
		/>
	{/if}
	{#if resumes.length > 0}
		<ul class="space-y-4">
			{#each resumes as r (r.i)}
				<li
					class="rounded-lg border border-pink-200 p-4 hover:border-pink-400"
				>
					<a href={`/resume/${r.i}`} class="block">
						<div class="font-semibold">
							{targetUserId} - {formatDate(
								r.l || r.d || 0
							)}
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
