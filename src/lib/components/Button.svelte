<script lang="ts">
	let { onClick, icon = '', text = '', disabled = false } = $props();

	// Determine if it's an icon-only button
	let isIconOnly = $state(!text && icon);
</script>

<button class="btn-hero-cta {icon} {isIconOnly ? 'px-6 py-6' : ''}" onclick={onClick} disabled={disabled}>
	<div class="btn-hero-cta-content">
		{#if icon}
			<i class={icon}></i>
		{/if}
		{#if text}
			<span>{text}</span>
		{/if}
	</div>
</button>
