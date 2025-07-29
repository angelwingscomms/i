<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { toasts } from '$lib/toast';
	import { fade } from 'svelte/transition';

	let { children, data } = $props();
	
	$effect(() => {
		console.log('Toasts changed:', $toasts);
	});
	
</script>

<Navbar user={data?.user} />
{@render children()}

<div class="pointer-events-none fixed top-4 right-4 z-[1000] flex flex-col gap-2">
	{#each $toasts as toast (toast.id)}
		<div
			class="pointer-events-auto flex max-w-md min-w-[250px] items-center justify-between rounded bg-gray-800 p-3 px-4 text-white shadow-md
			{toast.type === 'success' ? 'bg-green-500' : ''}
			{toast.type === 'error' ? 'bg-red-500' : ''}
			{toast.type === 'info' ? 'bg-blue-500' : ''}
			{toast.type === 'warning' ? 'bg-yellow-500' : ''}"
			transition:fade={{ duration: 150 }}
			role="alert"
			aria-live="assertive"
			aria-atomic="true"
		>
			<div class="mr-4 flex-grow">{toast.message}</div>
			<button
				class="cursor-pointer border-none bg-transparent px-2 text-2xl leading-none text-white hover:opacity-70"
				onclick={() => toasts.remove(toast.id)}
			>
				&times;
			</button>
		</div>
	{/each}
</div>
