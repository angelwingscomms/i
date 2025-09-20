<script lang="ts">
	let {
		onclick,
		text = '',
		loading = false,
		disabled = false,
		wide = false,
		href,
		icon,
		variant = 'primary',
		active = false
	}: {
		onclick?: (event: MouseEvent) => void;
		text?: string;
		loading?: boolean;
		disabled?: boolean;
		wide?: boolean;
		href?: string;
		icon?: string;
		variant?: 'primary' | 'secondary';
		active?: boolean;
	} = $props();
</script>

{#if href}
	<a
		{href}
		class="btn-{variant} {wide ? 'btn-wide' : ''} {active ? 'bg-[var(--color-theme-1)] text-white' : ''}"
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
		class="btn-{variant} {wide ? 'btn-wide' : ''} {active ? 'bg-[var(--color-theme-1)] text-white' : ''}"
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
