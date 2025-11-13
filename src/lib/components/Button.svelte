<script lang="ts">
	import { navigating, page } from '$app/state';

	let {
		onclick,
		text = '',
		loading = false,
		disabled = false,
		wide = false,
		href,
		icon,
		variant = 'primary',
		active = false,
		formaction,
		type = 'submit'
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
		formaction?: string;
		type?: 'button' | 'submit' | 'reset';
	} = $props();

	const effectiveLoading = $derived.by(
		() =>
			loading ||
			(href &&
				navigating?.to &&
				page.url.pathname ===
					navigating.to.url.pathname)
	);
</script>

{#if href}
	<a
		{href}
		class="btn-{variant} {wide
			? 'btn-wide'
			: ''} {active ? 'border-white text-white' : ''}"
		{onclick}
	>
		{#if effectiveLoading}
			<i class="fas fa-spinner fa-spin"></i>
		{:else}
			{#if icon}
				<i
					class={icon?.includes(' ')
						? icon
						: `fas ${icon}`}
				></i>
			{/if}
			{text}
		{/if}
	</a>
{:else}
	<button
		class="btn-{variant} {wide
			? 'btn-wide'
			: ''} {active ? 'border-white text-white' : ''}"
		{onclick}
		{formaction}
		{type}
		disabled={effectiveLoading || disabled}
	>
		{#if effectiveLoading}
			<i class="fas fa-spinner fa-spin"></i>
		{:else}
			{#if icon}
				<i
					class={icon?.includes(' ')
						? icon
						: `fas ${icon}`}
				></i>
			{/if}
			{text}
		{/if}
	</button>
{/if}
