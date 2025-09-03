<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import type { PageData } from './$types';
	import { createTimeline, animate } from 'animejs';
	import axios from 'axios';
	import RealtimeKitClient from '@cloudflare/realtimekit';

	let data: PageData = $props();
	let meeting: RealtimeKitClient | undefined = undefined;

	onMount(() => {
		// Simple entrance animation sequence
		const timeline = createTimeline()
			.add(
				'.hero-title',
				{
					opacity: [0, 1],
					translateY: [100, 0],
					scale: [0.8, 1],
					duration: 1200
				},
				'-=1500'
			)
			.add(
				'.hero-content',
				{
					opacity: [0, 1],
					translateY: [50, 0],
					duration: 800
				},
				'-=800'
			)
			.add(
				'.hero-cta',
				{
					opacity: [0, 1],
					translateY: [30, 0],
					scale: [0.9, 1],
					duration: 600
				},
				'-=400'
			);

		// Pulse animation for CTA button
		animate('.pulse-button', {
			scale: [1, 1.05, 1],
			duration: 2000,
			loop: true,
			ease: 'inOutSine'
		});

		// Interactive hover animations for buttons
		document.addEventListener('mouseover', (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('interactive-btn')) {
				animate(target, {
					scale: 1.1,
					duration: 200,
					ease: 'outQuart'
				});
			}
		});

		document.addEventListener('mouseout', (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('interactive-btn')) {
				animate(target, {
					scale: 1,
					duration: 200,
					ease: 'outQuart'
				});
			}
		});
	});

	function handleGetStarted() {
		if (data.user) {
			goto('/u');
		} else {
			goto('/google');
		}
	}
</script>

<main class="from-bg-primary via-bg-secondary to-bg-tertiary min-h-screen bg-gradient-to-br">
	<!-- Hero Section -->
	<section
		class="hero-section relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-20"
	>
		<!-- Hero Content -->
		<div class="relative z-10 mx-auto max-w-4xl text-center">
			<div class="hero-title mb-8">
				<h1
					class="mb-6 text-6xl leading-tight font-black sm:text-4xl md:text-5xl lg:text-6xl"
					style="color: var(--color-theme-4);"
				>
					<span style="color: var(--color-theme-1);">apex</span><span
						style="color: var(--color-theme-2);">links</span
					>
				</h1>
				<div class="mx-auto h-1 w-24 rounded-full" style="background: var(--color-theme-3);"></div>
			</div>

			<div class="hero-content mb-12">
				<p
					class="mx-auto max-w-3xl text-2xl leading-relaxed font-medium text-gray-700 sm:text-lg md:text-xl dark:text-gray-300"
				>
					apexlinks is a place to find and interact with the exact kind of people you're looking for
					and interact w/ them.
					<br /><br />
					<span style="color: var(--color-theme-3); font-weight: 600;">
						you can find groups of people that share the same passions as you.
					</span>
					<br /><br />
					you can also list products and services and search for other user's products and services
				</p>
			</div>

			<div class="hero-cta">
				<button
					class="pulse-button interactive-btn group relative overflow-hidden rounded-full px-12 py-6 text-2xl font-bold transition-all sm:px-8 sm:py-4 sm:text-lg"
					style="background: transparent; border: 2px solid var(--color-theme-1); color: var(--color-theme-1);"
					onclick={handleGetStarted}
				>
					<div
						class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20"
					></div>
					<div class="relative flex items-center gap-3">
						<svg
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="sm:h-6 sm:w-6"
						>
							<path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z" />
						</svg>
						{data.user ? 'Start Connecting' : 'Get Started'}
					</div>
				</button>
				<button
					onclick={async () => {
						meeting = await RealtimeKitClient.init({
							authToken: (await axios.get('/')).data,
							defaults: {
								audio: false,
								video: false
							}
						});
					}}
					class="pulse-button interactive-btn group relative mt-4 overflow-hidden rounded-full px-12 py-6 text-2xl font-bold transition-all sm:px-8 sm:py-4 sm:text-lg"
					style="background: transparent; border: 2px solid var(--color-theme-2); color: var(--color-theme-2);"
				>
					<div
						class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20"
					></div>
					<div class="relative flex items-center gap-3">
						<svg
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="sm:h-6 sm:w-6"
						>
							<path
								d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"
							/>
						</svg>
						Video Chat
					</div>
				</button>
			</div>
		</div>
	</section>
</main>

{#if meeting}
	<rtk-meeting {meeting} id="my-meeting"></rtk-meeting>
{/if}
