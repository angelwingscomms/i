<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import MobileSidebar from '$lib/components/MobileSidebar.svelte';
	import { toasts, toast, removeToast } from '$lib/util/toast';
	import { fade } from 'svelte/transition';
	import { themeStore } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	import { ensurePushSubscribed } from '$lib/util/notifications';
	import { animate, createTimeline, stagger, utils } from 'animejs';

	let { children, data } = $props();
	let is_sidebar_open = $state(false);

	const animateOrb = async (orb: Element) => {
		// We wrap the logic in a continuous loop
		while (true) {
			await animate(orb, {
				translateX: () => utils.random(-window.innerWidth / 3, window.innerWidth / 3),
				translateY: () => utils.random(-window.innerHeight / 3, window.innerHeight / 3),
				duration: () => utils.random(5000, 8000),
				easing: 'inOutSine'
			})
		}
	};

	onMount(() => {
		themeStore.init();
		if (data?.user?.i) {
			ensurePushSubscribed(data.user.i).then((res) => {
				if (res.ok) return;
				if (res.reason === 'denied') {
					toast.info('Enable notifications anytime in your browser settings.');
				}
			});
		}

		// Animated background orbs
		const timeline = createTimeline().add('.hero-background-orb', {
			scale: [0, 1],
			opacity: [0, 0.3],
			duration: 2000,
			delay: stagger(300)
		});

		async function randomMovement(element: Element) {
			const orbs = document.querySelectorAll('.hero-background-orb');
			orbs.forEach((orb) => {
				// We start the infinite animation loop for each orb
				animateOrb(orb);
			});
		}

		const orbs = document.querySelectorAll('.hero-background-orb');
		orbs.forEach((orb) => {
			randomMovement(orb);
		});
	});
</script>

<svelte:head>
	<meta name="theme-color" content="#000000" />
</svelte:head>

<div class="absolute inset-0 -z-10 overflow-hidden">
	<div
		class="hero-background-orb absolute -top-20 -left-20 h-64 w-64 rounded-full opacity-0"
		style="background: var(--color-theme-1);"
	></div>
	<div
		class="hero-background-orb absolute -right-20 -bottom-20 h-80 w-80 rounded-full opacity-0"
		style="background: var(--color-theme-6);"
	></div>
	<div
		class="hero-background-orb absolute top-1/4 left-1/4 h-32 w-32 rounded-full opacity-0"
		style="background: var(--color-theme-3);"
	></div>
	<div
		class="hero-background-orb absolute right-1/3 bottom-1/4 h-48 w-48 rounded-full opacity-0"
		style="background: var(--color-theme-2);"
	></div>
	<div
		class="hero-background-orb absolute top-1/2 right-1/4 h-24 w-24 rounded-full opacity-0"
		style="background: var(--color-theme-4);"
	></div>
</div>

<Navbar user={data?.user as any} onmenutoggle={() => (is_sidebar_open = !is_sidebar_open)} />
<MobileSidebar bind:is_open={is_sidebar_open} user={data?.user as any} />
{@render children()}

<div class="pointer-events-none fixed top-4 right-4 z-[1000] flex flex-col gap-2">
	{#each $toasts as toastItem (toastItem.id)}
		<div
			class="pointer-events-auto flex max-w-md min-w-[250px] items-center justify-between rounded-xl p-4 text-white backdrop-blur-lg
			{toastItem.type === 'success' ? 'success-card' : ''}
			{toastItem.type === 'error' ? 'error-card' : ''}
			{toastItem.type === 'info' ? 'message-card' : ''}
			{toastItem.type === 'warning' ? 'warning-card' : ''}"
			style="box-shadow: var(--shadow-lg);
			{toastItem.type === 'success' ? 'background: var(--text-success); color: white;' : ''}
			{toastItem.type === 'error' ? 'background: var(--text-error); color: white;' : ''}
			{toastItem.type === 'info' ? 'background: var(--accent-blue); color: white;' : ''}
			{toastItem.type === 'warning' ? 'background: var(--text-warning); color: white;' : ''}"
			transition:fade={{ duration: 150 }}
			role="alert"
			aria-live="assertive"
			aria-atomic="true"
		>
			<div class="mr-4 flex-grow">{toastItem.message}</div>
			{#if toastItem.action}
				<button
					class="btn-ghost btn-sm"
					onclick={() => {
						toastItem.action?.callback();
						removeToast(toastItem.id);
					}}>{toastItem.action.label}</button
				>
			{/if}
			<button
				class="cursor-pointer border-none bg-transparent px-2 text-2xl leading-none text-white transition-opacity duration-200 hover:opacity-70"
				onclick={() => removeToast(toastItem.id)}
			>
				&times;
			</button>
		</div>
	{/each}
</div>
