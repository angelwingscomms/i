<script lang="ts">
	let {
		on_click,
		text = '',
		loading = false,
		disabled = false,
		wide = false,
		href
	} = $props();
</script>

{#if href}
	<a
		href={href}
		class="btn-primary {wide ? 'btn-wide' : ''}"
		onclick={on_click}
	>
		{#if loading}
			<i class="fas fa-spinner fa-spin"></i>
		{:else}
			{text}
		{/if}
	</a>
{:else}
	<button
		class="btn-primary {wide ? 'btn-wide' : ''}"
		onclick={on_click}
		disabled={loading || disabled}
	>
		{#if loading}
			<i class="fas fa-spinner fa-spin"></i>
		{:else}
			{text}
		{/if}
	</button>
{/if}
