<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import MobileSidebar from '$lib/components/MobileSidebar.svelte';
	import PushNotificationBanner from '$lib/components/PushNotificationBanner.svelte';
	import {
		toasts,
		toast,
		removeToast
	} from '$lib/util/toast';
	import { fade } from 'svelte/transition';
	import { themeStore } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	import { ensurePushSubscribed } from '$lib/util/notifications';
	import {
		animate,
		createTimeline,
		stagger,
		utils
	} from 'animejs';
	import { defineCustomElements } from '@cloudflare/realtimekit-ui/loader';

	defineCustomElements();

	let { children, data } = $props();
	let is_sidebar_open = $state(false);

	const animateOrb = (orb: Element) => {
		const runAnimation = () => {
			animate(orb, {
				translateX: () =>
					utils.random(
						-window.innerWidth,
						window.innerWidth
					),
				translateY: () =>
					utils.random(
						-window.innerHeight,
						window.innerHeight
					),
				duration: () => utils.random(5000, 8000),
				complete: () => {
					// Small delay before next animation
					setTimeout(runAnimation, 1000);
				}
				// easing: 'inOutSine'
			});
		};
		runAnimation();
	};

	onMount(() => {
		// Add global error handling for navigation issues
		window.addEventListener('error', (event) => {
			console.error(
				'Global error caught:',
				event.error
			);
			if (
				event.error?.message?.includes(
					'navigation'
				) ||
				event.error?.message?.includes('redirect')
			) {
				console.error(
					'Navigation-related error detected:',
					event.error
				);
			}
		});

		window.addEventListener(
			'unhandledrejection',
			(event) => {
				console.error(
					'Unhandled promise rejection:',
					event.reason
				);
				if (
					event.reason?.message?.includes(
						'navigation'
					) ||
					event.reason?.message?.includes('redirect')
				) {
					console.error(
						'Navigation-related promise rejection:',
						event.reason
					);
				}
			}
		);

		themeStore.init();
		if (data?.user?.i) {
			ensurePushSubscribed(data.user.i).then(
				(res) => {
					if (res.ok) return;
					if (res.reason === 'denied') {
						toast.info(
							'Enable notifications anytime in your browser settings.'
						);
					}
				}
			);
		}

		// Animated background orbs
		const timeline = createTimeline().add(
			'.hero-background-orb',
			{
				scale: [0, 1],
				opacity: [0, 0.054], // Reduced opacity from 0.3 to 0.1
				duration: 2000,
				delay: stagger(300)
			}
		);

		async function randomMovement(element: Element) {
			const orbs = document.querySelectorAll(
				'.hero-background-orb'
			);
			orbs.forEach((orb) => {
				// We start the infinite animation loop for each orb
				animateOrb(orb);
			});
		}

		const orbs = document.querySelectorAll(
			'.hero-background-orb'
		);
		orbs.forEach((orb) => {
			randomMovement(orb);
		});
	});
</script>

<svelte:head>
	<meta name="theme-color" content="#000000" />
	{#if data.seo}
		<title>{data.seo.title}</title>
		<meta
			name="description"
			content={data.seo.description}
		/>

		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="website" />
		<meta
			property="og:url"
			content={data.seo.og_url}
		/>
		<meta
			property="og:title"
			content={data.seo.og_title}
		/>
		<meta
			property="og:description"
			content={data.seo.og_description}
		/>
		<meta
			property="og:image"
			content={data.seo.og_image}
		/>

		<!-- Twitter -->
		<meta
			property="twitter:card"
			content={data.seo.twitter_card}
		/>
		<meta
			property="twitter:url"
			content={data.seo.og_url}
		/>
		<meta
			property="twitter:title"
			content={data.seo.twitter_title}
		/>
		<meta
			property="twitter:description"
			content={data.seo.twitter_description}
		/>
		<meta
			property="twitter:image"
			content={data.seo.twitter_image}
		/>
	{/if}
</svelte:head>

<div
	class="fixed inset-0 -z-10 min-h-screen overflow-hidden"
>
	<div
		class="hero-background-orb absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-0"
		style="background: var(--color-theme-1); opacity: 0.1;"
	></div>
	<div
		class="hero-background-orb absolute -right-32 -bottom-32 h-[30rem] w-[30rem] rounded-full opacity-0"
		style="background: var(--color-theme-6); opacity: 0.1;"
	></div>
	<div
		class="hero-background-orb absolute top-1/4 left-1/4 h-64 w-64 rounded-full opacity-0"
		style="background: var(--color-theme-3); opacity: 0.1;"
	></div>
	<div
		class="hero-background-orb absolute right-1/3 bottom-1/4 h-80 w-80 rounded-full opacity-0"
		style="background: var(--color-theme-2); opacity: 0.1;"
	></div>
	<div
		class="hero-background-orb absolute top-1/2 right-1/4 h-48 w-48 rounded-full opacity-0"
		style="background: var(--color-theme-4); opacity: 0.1;"
	></div>
	<div
		class="hero-background-orb absolute bottom-1/3 left-1/3 h-72 w-72 rounded-full opacity-0"
		style="background: var(--color-theme-5); opacity: 0.1;"
	></div>
	<div
		class="hero-background-orb absolute top-2/3 right-1/3 h-56 w-56 rounded-full opacity-0"
		style="background: var(--color-theme-1); opacity: 0.1;"
	></div>
</div>

<Navbar
	user={data?.user as any}
	on:menutoggle={() =>
		(is_sidebar_open = !is_sidebar_open)}
/>
<MobileSidebar
	is_open={is_sidebar_open}
	user={data?.user as any}
	onClose={() => (is_sidebar_open = false)}
/>
{@render children()}

<PushNotificationBanner userId={data?.user?.i} />

<div
	class="pointer-events-none fixed top-4 right-4 z-[1000] flex flex-col gap-2"
>
	{#each toasts as toastItem (toastItem.id)}
		<div
			class="pointer-events-auto flex max-w-md min-w-[250px] items-center justify-between rounded-xl p-4 text-white backdrop-blur-lg
			{toastItem.type === 'success' ? 'success-card' : ''}
			{toastItem.type === 'error' ? 'error-card' : ''}
			{toastItem.type === 'info' ? 'message-card' : ''}
			{toastItem.type === 'warning' ? 'warning-card' : ''}"
			style="box-shadow: var(--shadow-lg);
			{toastItem.type === 'success'
				? 'background: var(--text-success); color: white;'
				: ''}
			{toastItem.type === 'error'
				? 'background: var(--text-error); color: white;'
				: ''}
			{toastItem.type === 'info'
				? 'background: var(--accent-blue); color: white;'
				: ''}
			{toastItem.type === 'warning'
				? 'background: var(--text-warning); color: white;'
				: ''}"
			transition:fade={{ duration: 150 }}
			role="alert"
			aria-live="assertive"
			aria-atomic="true"
		>
			<div class="mr-4 flex-grow">
				{toastItem.message}
			</div>
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
