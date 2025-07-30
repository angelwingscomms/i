<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { toasts } from '$lib/toast';
	import { fade } from 'svelte/transition';
	import { themeStore } from '$lib/stores/theme';
	import { onMount } from 'svelte';

	let { children, data } = $props();

	onMount(() => {
		themeStore.init();
	});
</script>

<Navbar user={data?.user} />
{@render children()}

<div class="pointer-events-none fixed top-4 right-4 z-[1000] flex flex-col gap-2">
	{#each $toasts as toast (toast.id)}
		<div
			class="pointer-events-auto flex max-w-md min-w-[250px] items-center justify-between rounded-xl p-4 text-white backdrop-blur-lg
			{toast.type === 'success' ? 'success-card' : ''}
			{toast.type === 'error' ? 'error-card' : ''}
			{toast.type === 'info' ? 'message-card' : ''}
			{toast.type === 'warning' ? 'warning-card' : ''}"
			style="box-shadow: var(--shadow-lg);
			{toast.type === 'success' ? 'background: var(--text-success); color: white;' : ''}
			{toast.type === 'error' ? 'background: var(--text-error); color: white;' : ''}
			{toast.type === 'info' ? 'background: var(--accent-blue); color: white;' : ''}
			{toast.type === 'warning' ? 'background: var(--text-warning); color: white;' : ''}"
			transition:fade={{ duration: 150 }}
			role="alert"
			aria-live="assertive"
			aria-atomic="true"
		>
			<div class="mr-4 flex-grow">{toast.message}</div>
			<button
				class="cursor-pointer border-none bg-transparent px-2 text-2xl leading-none text-white transition-opacity duration-200 hover:opacity-70"
				onclick={() => toasts.remove(toast.id)}
			>
				&times;
			</button>
		</div>
	{/each}
</div>
