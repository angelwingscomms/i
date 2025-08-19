<script lang="ts">
	import { page } from '$app/stores';
	let { mode, description = $bindable() }: { mode: 'profile' | 'custom'; description: string } = $props();
</script>

{#if !$page.data.user || mode === 'custom'}
	<div class="mt-3">
		<input
			class="input-rect w-full"
			placeholder="describe the kind of person you're looking for"
			bind:value={description}
			style="background: transparent; border: 1px solid var(--color-theme-6);"
		/>
	</div>
{/if}
