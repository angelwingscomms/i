<script lang="ts">
	let {
		onclick,
		text = '',
		loading = false,
		disabled = false,
		wide = false,
		href
	}: {
		onclick?: (event: MouseEvent) => void;
		text?: string;
		loading?: boolean;
		disabled?: boolean;
		wide?: boolean;
		href?: string;
	} = $props();
</script>

{#if href}
	<a
		href={href}
		class="btn-primary {wide ? 'btn-wide' : ''}"
		{onclick}
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
		{onclick}
		disabled={loading || disabled}
	>
		{#if loading}
			<i class="fas fa-spinner fa-spin"></i>
		{:else}
			{text}
		{/if}
	</button>
{/if}
