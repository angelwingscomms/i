<script lang="ts">
	import Button from './Button.svelte';

	let {
		icon,
		themeColor,
		title,
		description,
		href,
		buttonText,
		image,
		alt
	}: {
		icon?: string;
		themeColor: string;
		title: string;
		description: string;
		href: string;
		buttonText: string;
		image?: string;
		alt?: string;
	} = $props();
</script>

<div class="feature-card rounded-3xl w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] border border-[var(--border-primary)] border-t-0 border-r-0">
	{#if image}
		<img src={image} alt={alt || title} class="w-full aspect-square object-cover rounded-t-3xl mb-4" />
	{/if}
	{#if icon}
		<div class="feature-icon" style="background-color: {themeColor};">
			<i class={icon}></i>
		</div>
	{/if}
	<h3 class="feature-title">{title}</h3>
	<p class="feature-description">{description}</p>
	<Button {href} variant="secondary" text={buttonText} />
</div>