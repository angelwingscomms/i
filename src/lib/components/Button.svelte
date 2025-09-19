<script lang="ts">
	let {
		onclick,
		text = '',
		loading = false,
		disabled = false,
		wide = false,
		href,
		icon,
		variant = 'primary'
	}: {
		onclick?: (event: MouseEvent) => void;
		text?: string;
		loading?: boolean;
		disabled?: boolean;
		wide?: boolean;
		href?: string;
		icon?: string;
		variant?: 'primary' | 'secondary';
	} = $props();
</script>

{#if href}
	<a
		{href}
		class="btn-{variant} {wide ? 'btn-wide' : ''} py-1.5"
		{onclick}
	>
		{#if loading}
			<i class="fas fa-spinner fa-spin"></i>
		{:else}
			{#if icon}
				<i class="fas {icon}"></i>
			{/if}
			{text}
		{/if}
	</a>
{:else}
	<button
		class="btn-{variant} {wide ? 'btn-wide' : ''} py-1.5"
		{onclick}
		disabled={loading || disabled}
	>
		{#if loading}
			<i class="fas fa-spinner fa-spin"></i>
		{:else}
			{#if icon}
				<i class="fas {icon}"></i>
			{/if}
			{text}
		{/if}
	</button>
{/if}
