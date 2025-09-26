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
		<!-- Display Images -->
		{#if item.x && item.x.length > 0}
			<div
				class="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2"
			>
				{#each item.x as img (img)}
					<img
						src={img}
						alt={item.t}
						class="w-full rounded object-cover"
					/>
				{/each}
			</div>
		{/if}

		<p class="mb-4">{item.t}</p>
		<Button
			onclick={handle_click}
			text="update"
			icon="fa-save"
		/>
	</div>
{/if}
