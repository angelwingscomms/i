<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import axios from "axios";

	let loading = $state(false);

	async function startNewChat() {
		loading = true;
		try {
			const response = await axios.post(page.url.pathname);
			goto(`/r/${response.data}`);
		} catch (error) {
			console.error('Failed to start new chat:', error);
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-2xl mx-auto p-4">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-semibold" style="color: var(--color-theme-4);">anonymous chats with {page.data.t}</h1>
		<button 
			onclick={startNewChat}
			disabled={loading}
			class="action-button group relative overflow-hidden rounded-full px-6 py-3 text-white shadow-xl transition-all"
			style="background: var(--color-theme-2);"
		>
			<div class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20"></div>
			<div class="relative flex items-center gap-2">
				{#if loading}
					<svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
					</svg>
				{/if}
				start new anon chat
			</div>
		</button>
	</div>
	
	{#if page.data.c.length === 0}
		<p class="text-gray-500">no chats yet</p>
	{:else}
		<div class="space-y-4">
			{#each page.data.c as chat}
				<a 
					href="/r/{chat.i}"
					class="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
				>
					<time datetime={new Date(chat.a).toISOString()} class="text-gray-600">
						{new Date(chat.a).toLocaleDateString('en-us', { 
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</time>
				</a>
			{/each}
		</div>
	{/if}
</div>
