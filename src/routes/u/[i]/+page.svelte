<script lang="ts">
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import {
		animate,
		createTimeline,
		stagger
	} from 'animejs';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	console.log('d', data);
	let {
		u: user,
		c: comparison,
		s: is_own_profile
	} = data as unknown as {
		u: {
			i: string;
			tag: string;
			avatar?: string;
			age?: number;
			gender?: number;
			description?: string;
			socialLinks: string[];
		};
		c: string;
		s: boolean;
	};

	let copied = $state(false);

	onMount(() => {
		// Entrance animations
		createTimeline()
			.add('.profile-hero', {
				opacity: [0, 1],
				translateY: [50, 0],
				duration: 1000,
				ease: 'outExpo'
			})
			.add(
				'.profile-avatar',
				{
					scale: [0.8, 1],
					rotate: [10, 0],
					duration: 800
				},
				'-=600'
			)
			.add(
				'.profile-info',
				{
					opacity: [0, 1],
					translateY: [30, 0],
					duration: 600,
					delay: stagger(100)
				},
				'-=400'
			)
			.add(
				'.feature-card',
				{
					opacity: [0, 1],
					translateY: [40, 0],
					scale: [0.9, 1],
					duration: 600,
					delay: stagger(150)
				},
				'-=200'
			);

		// Floating animation for avatar
		animate('.profile-avatar', {
			translateY: [-5, 5],
			duration: 3000,
			direction: 'alternate',
			loop: true,
			ease: 'inOutSine'
		});

		// Hover animations for interactive elements
		const interactiveElements =
			document.querySelectorAll(
				'.interactive-card, .action-button, .feature-link'
			);
		interactiveElements.forEach((el) => {
			el.addEventListener('mouseenter', () => {
				animate(el, {
					scale: 1.05,
					duration: 300,
					ease: 'outQuart'
				});
			});

			el.addEventListener('mouseleave', () => {
				animate(el, {
					scale: 1,
					duration: 300,
					ease: 'outQuart'
				});
			});
		});
	});

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(
				`${window.location.origin}/u/${user?.i ?? ''}`
			);
			copied = true;

			// Copy success animation
			animate('.copy-button', {
				scale: [1, 1.2, 1],
				duration: 400,
				ease: 'outElastic(1, .8)'
			});

			setTimeout(() => (copied = false), 1200);
		} catch {
			// Do nothing on error
		}
	}
	function getSocialMediaInfo(url: string): {
		name: string;
		iconClass: string | null;
	} {
		try {
			const hostname = new URL(url).hostname;
			if (hostname.includes('facebook.com'))
				return {
					name: 'Facebook',
					iconClass: 'icon-facebook'
				};
			if (
				hostname.includes('twitter.com') ||
				hostname.includes('x.com')
			)
				return { name: 'X', iconClass: 'icon-x' };
			if (hostname.includes('instagram.com'))
				return {
					name: 'Instagram',
					iconClass: 'icon-instagram'
				};
			if (hostname.includes('linkedin.com'))
				return {
					name: 'LinkedIn',
					iconClass: 'icon-linkedin'
				};
			if (hostname.includes('github.com'))
				return {
					name: 'GitHub',
					iconClass: 'icon-github'
				};
			if (hostname.includes('youtube.com'))
				return {
					name: 'YouTube',
					iconClass: 'icon-youtube'
				};
			if (hostname.includes('tiktok.com'))
				return {
					name: 'TikTok',
					iconClass: 'icon-tiktok'
				};
			if (hostname.includes('discord.gg'))
				return {
					name: 'Discord',
					iconClass: 'icon-discord'
				};
			if (hostname.includes('pinterest.com'))
				return {
					name: 'Pinterest',
					iconClass: 'icon-pinterest'
				};
			if (hostname.includes('reddit.com'))
				return {
					name: 'Reddit',
					iconClass: 'icon-reddit'
				};
			if (hostname.includes('spotify.com'))
				return {
					name: 'Spotify',
					iconClass: 'icon-spotify'
				};
			if (hostname.includes('twitch.tv'))
				return {
					name: 'Twitch',
					iconClass: 'icon-twitch'
				};
			if (hostname.includes('medium.com'))
				return {
					name: 'Medium',
					iconClass: 'icon-medium'
				};
			if (hostname.includes('snapchat.com'))
				return {
					name: 'Snapchat',
					iconClass: 'icon-snapchat'
				};
			if (hostname.includes('telegram.org'))
				return {
					name: 'Telegram',
					iconClass: 'icon-telegram'
				};
			return {
				name: new URL(url).hostname
					.replace('www.', '')
					.split('.')[0],
				iconClass: null
			}; // Generic name, no specific icon
		} catch {
			return { name: url, iconClass: null }; // Fallback to raw URL, no specific icon
		}
	}
</script>

<svelte:head>
	<title>{user?.tag || 'User'} - User Profile</title>
</svelte:head>

<div
	class="from-bg-primary via-bg-secondary to-bg-tertiary min-h-screen bg-gradient-to-br"
>
	{#if user}
		<!-- Hero Section -->
		<section
			class="profile-hero relative overflow-hidden px-4 py-16 sm:px-2 sm:py-12"
		>
			<!-- Floating background elements -->
			<div class="absolute inset-0 overflow-hidden">
				<div
					class="floating-orb absolute -top-10 -left-10 h-32 w-32 rounded-full opacity-20"
					style="background: var(--color-theme-1);"
				></div>
				<div
					class="floating-orb absolute -right-10 -bottom-10 h-40 w-40 rounded-full opacity-15"
					style="background: var(--color-theme-6);"
				></div>
				<div
					class="floating-orb absolute top-1/2 left-1/4 h-24 w-24 rounded-full opacity-10"
					style="background: var(--color-theme-3);"
				></div>
			</div>

			<div
				class="relative mx-auto max-w-4xl text-center"
			>
				<!-- Avatar with glow effect -->
				<div
					class="profile-avatar mb-8 flex justify-center"
				>
					<div class="relative">
						<div
							class="absolute inset-0 rounded-full opacity-30 blur-xl"
							style="background: var(--color-theme-1);"
						></div>
						<div
							class="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-2xl"
							style="border-color: var(--color-theme-6);"
						>
							{#if user.avatar}
								<img
									src={user.avatar}
									alt={user.tag}
									class="h-full w-full object-cover"
								/>
							{:else}
								<div
									class="flex h-full w-full items-center justify-center text-4xl font-bold text-white"
									style="background: var(--color-theme-4);"
								>
									{user.tag.charAt(0).toUpperCase()}
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- User Info -->
				<div class="profile-info space-y-4">
					<h1
						class="text-5xl font-bold sm:text-3xl"
						style="color: var(--color-theme-4);"
					>
						{user.tag}
					</h1>

					<div
						class="flex flex-wrap justify-center gap-4 sm:flex-col sm:items-center"
					>
						<span
							class="interactive-card rounded-full px-6 py-3 font-semibold text-white shadow-lg"
							style="background: var(--color-theme-1);"
						>
							Age: {user.age}
						</span>
						<span
							class="interactive-card rounded-full px-6 py-3 font-semibold text-white shadow-lg"
							style="background: var(--color-theme-2);"
						>
							<div
								class="mt-2 flex items-center justify-center gap-3"
							>
								<span
									class="badge"
									title="online status"
									>{data.u?.on &&
									Date.now() - (data.u.on as any) <
										60_000
										? 'online'
										: 'offline'}</span
								>
								<span
									class="badge"
									title="in call status"
									>{(data.u as any)?.ic
										? 'in call'
										: 'not in call'}</span
								>
							</div>

							{user.gender === 0 ? 'Male' : 'Female'}
						</span>
					</div>

					<!-- Share Profile -->
					<div class="mt-8 space-y-3">
						<p
							class="text-lg font-medium"
							style="color: var(--color-theme-4);"
						>
							Share Profile
						</p>
						<div
							class="flex items-center justify-center gap-3 sm:flex-col"
						>
							<div
								class="rounded-full px-6 py-3 text-sm font-medium shadow-inner"
								style="background: var(--accent-lilac-light); color: var(--color-theme-4);"
							>
								{#if typeof window !== 'undefined'}{window
										.location.origin}/u/{user.i}{/if}
							</div>
							<button
								class="copy-button action-button rounded-full px-6 py-3 font-semibold text-white shadow-lg transition-all"
								style="background: var(--color-theme-3);"
								onclick={copyLink}
							>
								{copied ? '✓ Copied!' : 'Copy Link'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Compatibility & Actions Section -->
		<section
			class="mx-auto max-w-6xl px-4 py-16 sm:px-2 sm:py-8"
		>
			{#if !is_own_profile && data.user}
				{#if comparison}
					<div
						class="feature-card interactive-card mb-12 rounded-3xl p-8 shadow-2xl"
						style=" border: 2px solid var(--color-theme-6);"
					>
						<h2
							class="mb-6 flex items-center gap-3 text-3xl font-bold"
							style="color: var(--color-theme-4);"
						>
							<div
								class="rounded-full p-3"
								style="background: var(--color-theme-6);"
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="white"
								>
									<path
										d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5 2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"
									/>
								</svg>
							</div>
							What You Have in Common
						</h2>
						<div
							class="prose prose-lg max-w-none leading-relaxed"
							style="color: var(--color-theme-4);"
						>
							{@html marked.parse(comparison)}
						</div>
					</div>
				{:else if !user.description}
					<div class="mb-12 p-8 text-center">
						<p class="text-lg font-medium">
							This user doesn't have a description
							yet. You'll be able to see similarities
							with them when they add a description.
						</p>
					</div>
				{/if}

				<!-- Chat Action -->
				<div class="mb-12 flex justify-center">
					<a
						href="/u/{user.i}/a"
						class="action-button group relative overflow-hidden rounded-full px-12 py-6 text-xl font-bold text-white shadow-2xl transition-all"
						style="background: var(--color-theme-2);"
					>
						<div
							class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20"
						></div>
						<div
							class="relative flex items-center gap-3"
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2M6,9H18V11H6V9M14,14H6V12H14V14M18,8H6V6H18V8Z"
								/>
							</svg>
							chat w {user.tag} anonymously
						</div>
					</a>
				</div>
				<div class="mb-12 flex justify-center">
					<a
						href="/u/{user.i}/c"
						class="action-button group relative overflow-hidden rounded-full px-12 py-6 text-xl font-bold text-white shadow-2xl transition-all"
						style="background: var(--color-theme-2);"
					>
						<div
							class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20"
						></div>
						<div
							class="relative flex items-center gap-3"
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2M6,9H18V11H6V9M14,14H6V12H14V14M18,8H6V6H18V8Z"
								/>
							</svg>
							chat w {user.tag}
						</div>
					</a>
				</div>

				<div class="mb-12 flex justify-center gap-4">
					<a
						href="/u/{user.i}/c?call=audio"
						class="action-button rounded-full px-8 py-4 text-lg font-bold text-white shadow-2xl"
						style="background: var(--color-theme-3);"
					>
						Audio call
					</a>
					<a
						href="/u/{user.i}/c?call=video"
						class="action-button rounded-full px-8 py-4 text-lg font-bold text-white shadow-2xl"
						style="background: var(--color-theme-1);"
					>
						Video call
					</a>
				</div>
			{:else if is_own_profile}
				<!-- Edit Profile Action -->
				<div class="mb-12 flex justify-center">
					<a
						href="/edit_user"
						class="action-button group relative overflow-hidden rounded-full px-12 py-6 text-xl font-bold text-white shadow-2xl transition-all"
						style="background: var(--color-theme-1);"
					>
						<div
							class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20"
						></div>
						<div
							class="relative flex items-center gap-3"
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
								/>
							</svg>
							Edit Your Profile
						</div>
					</a>
				</div>

				{#if !user.description}
					<div
						class="feature-card interactive-card mb-12 rounded-3xl p-8 text-center shadow-2xl"
						style=" border: 2px solid var(--color-theme-5);"
					>
						<div class="mb-4 flex justify-center">
							<div
								class="rounded-full p-4"
								style="background: var(--color-theme-5);"
							>
								<svg
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="white"
								>
									<path
										d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17Z"
									/>
								</svg>
							</div>
						</div>
						<p
							class="mb-4 text-lg font-medium"
							style="color: var(--color-theme-5);"
						>
							Complete your profile to unlock all
							features!
						</p>
						<a
							href="/edit_user"
							class="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all"
							style="background: var(--color-theme-4);"
						>
							Add Description
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
								/>
							</svg>
						</a>
					</div>
				{/if}
			{:else}
				<!-- Login Prompt -->
				<div
					class="feature-card interactive-card mb-12 rounded-3xl p-8 text-center shadow-2xl"
					style=" border: 2px solid var(--color-theme-6);"
				>
					<div class="mb-4 flex justify-center">
						<div
							class="rounded-full p-4"
							style="background: var(--color-theme-6);"
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="white"
							>
								<path
									d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
								/>
							</svg>
						</div>
					</div>
					<p
						class="mb-6 text-lg font-medium"
						style="color: var(--color-theme-4);"
					>
						Join our community to see compatibility
						and start conversations!
					</p>
					<a
						href="/google"
						class="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-white transition-all"
						style="background: var(--color-theme-2);"
					>
						Sign In to Connect
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
							/>
						</svg>
					</a>
				</div>
			{/if}
		</section>

		<!-- Platform Features Showcase -->
		<section
			class="mx-auto max-w-6xl px-4 py-16 sm:px-2 sm:py-8"
		>
			<div class="mb-12 text-center">
				<h2
					class="mb-4 text-4xl font-bold"
					style="color: var(--color-theme-4);"
				>
					Explore Our Platform
				</h2>
				<p
					class="text-xl"
					style="color: var(--color-theme-6);"
				>
					Discover amazing features and connect with
					your community
				</p>
			</div>

			<div
				class="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
			>
				<!-- Products & Services -->
				<div
					class="feature-card interactive-card rounded-3xl p-8 shadow-xl transition-all"
					style=" border: 2px solid var(--color-theme-1);"
				>
					<div class="mb-4 flex justify-center">
						<div
							class="rounded-full p-4"
							style="background: var(--color-theme-1);"
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="white"
							>
								<path
									d="M19,7H18V6A2,2 0 0,0 16,4H8A2,2 0 0,0 6,6V7H5A1,1 0 0,0 4,8V19A3,3 0 0,0 7,22H17A3,3 0 0,0 20,19V8A1,1 0 0,0 19,7M8,6H16V7H8V6M18,19A1,1 0 0,1 17,20H7A1,1 0 0,1 6,19V9H18V19Z"
								/>
							</svg>
						</div>
					</div>
					<h3
						class="mb-3 text-center text-xl font-bold"
						style="color: var(--color-theme-4);"
					>
						Products & Services
					</h3>
					<p
						class="mb-4 text-center"
						style="color: var(--color-theme-6);"
					>
						Discover local businesses, handcrafted
						products, and professional services in
						your area.
					</p>
					<div class="text-center">
						<a
							href="/i/create"
							class="feature-link inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all"
							style="background: var(--color-theme-1);"
						>
							Browse Items
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
								/>
							</svg>
						</a>
					</div>
				</div>

				<!-- Find Nearby -->
				<div
					class="feature-card interactive-card rounded-3xl p-8 shadow-xl transition-all"
					style=" border: 2px solid var(--color-theme-2);"
				>
					<div class="mb-4 flex justify-center">
						<div
							class="rounded-full p-4"
							style="background: var(--color-theme-2);"
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="white"
							>
								<path
									d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"
								/>
							</svg>
						</div>
					</div>
					<h3
						class="mb-3 text-center text-xl font-bold"
						style="color: var(--color-theme-4);"
					>
						Find Nearby
					</h3>
					<p
						class="mb-4 text-center text-gray-600 dark:text-gray-300"
					>
						Search for products and services near your
						location with smart filtering.
					</p>
					<div class="text-center">
						<a
							href="/i/search_nearby"
							class="feature-link inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all"
							style="background: var(--color-theme-2);"
						>
							Search Nearby
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
								/>
							</svg>
						</a>
					</div>
				</div>

				<!-- Chatrooms -->
				<div
					class="feature-card interactive-card rounded-3xl p-8 shadow-xl transition-all"
					style=" border: 2px solid var(--color-theme-3);"
				>
					<div class="mb-4 flex justify-center">
						<div
							class="rounded-full p-4"
							style="background: var(--color-theme-3);"
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="white"
							>
								<path
									d="M12,3C6.5,3 2,6.58 2,11A7.18,7.18 0 0,0 2.64,14.25L1,22L8.75,20.36C9.81,20.75 10.87,21 12,21C17.5,21 22,17.42 22,13C22,8.58 17.5,5 12,5M12,3C17.5,3 22,6.58 22,11C22,15.42 17.5,19 12,19C10.87,19 9.81,18.75 8.75,18.36L1,20L2.64,12.25A7.18,7.18 0 0,1 2,9C2,4.58 6.5,1 12,1Z"
								/>
							</svg>
						</div>
					</div>
					<h3
						class="mb-3 text-center text-xl font-bold"
						style="color: var(--color-theme-4);"
					>
						Chatrooms
					</h3>
					<p
						class="mb-4 text-center text-gray-600 dark:text-gray-300"
					>
						Join topic-based chatrooms and connect
						with like-minded people.
					</p>
					<div class="text-center">
						<a
							href="/r"
							class="feature-link inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all"
							style="background: var(--color-theme-3);"
						>
							Join Rooms
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
								/>
							</svg>
						</a>
					</div>
				</div>

				<!-- User Search -->
				<div
					class="feature-card interactive-card rounded-3xl p-8 shadow-xl transition-all"
					style=" border: 2px solid var(--color-theme-4);"
				>
					<div class="mb-4 flex justify-center">
						<div
							class="rounded-full p-4"
							style="background: var(--color-theme-4);"
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="white"
							>
								<path
									d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
								/>
							</svg>
						</div>
					</div>
					<h3
						class="mb-3 text-center text-xl font-bold"
						style="color: var(--color-theme-4);"
					>
						Find Users
					</h3>
					<p
						class="mb-4 text-center text-gray-600 dark:text-gray-300"
					>
						Search for users with detailed
						descriptions and find people similar to
						yourself.
					</p>
					<div class="text-center">
						<a
							href="/u"
							class="feature-link inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all"
							style="background: var(--color-theme-4);"
						>
							Search Users
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
								/>
							</svg>
						</a>
					</div>
				</div>

				<!-- AI Chat -->
				<div
					class="feature-card interactive-card rounded-3xl p-8 shadow-xl transition-all"
					style=" border: 2px solid var(--color-theme-5);"
				>
					<div class="mb-4 flex justify-center">
						<div
							class="rounded-full p-4"
							style="background: var(--color-theme-5);"
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="white"
							>
								<path
									d="M17.753,14A2.25,2.25 0 0,1 20,16.25C20,17.78 18.78,19 17.25,19H6.75C5.22,19 4,17.78 4,16.25A2.25,2.25 0 0,1 6.25,14H6V10A6,6 0 0,1 12,4A6,6 0 0,1 18,10V14H17.753M16,10A4,4 0 0,0 12,6A4,4 0 0,0 8,10V14H16V10Z"
								/>
							</svg>
						</div>
					</div>
					<h3
						class="mb-3 text-center text-xl font-bold"
						style="color: var(--color-theme-4);"
					>
						AI Assistant
					</h3>
					<p
						class="mb-4 text-center text-gray-600 dark:text-gray-300"
					>
						Chat with AI about products, get
						recommendations, and smart assistance.
					</p>
					<div class="text-center">
						<a
							href="/i"
							class="feature-link inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all"
							style="background: var(--color-theme-5);"
						>
							Try AI Chat
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
								/>
							</svg>
						</a>
					</div>
				</div>

				<!-- Direct Messaging -->
				<div
					class="feature-card interactive-card rounded-3xl p-8 shadow-xl transition-all"
					style=" border: 2px solid var(--color-theme-6);"
				>
					<div class="mb-4 flex justify-center">
						<div
							class="rounded-full p-4"
							style="background: var(--color-theme-6);"
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="white"
							>
								<path
									d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6V9M14,14H6V12H14V14M18,8H6V6H18V8Z"
								/>
							</svg>
						</div>
					</div>
					<h3
						class="mb-3 text-center text-xl font-bold"
						style="color: var(--color-theme-4);"
					>
						Direct Chat
					</h3>
					<p
						class="mb-4 text-center text-gray-600 dark:text-gray-300"
					>
						Chat directly with product owners and
						service providers.
					</p>
					<div class="text-center">
						<a
							href="/u"
							class="feature-link inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all"
							style="background: var(--color-theme-6);"
						>
							Start Chatting
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
								/>
							</svg>
						</a>
					</div>
				</div>
			</div>
		</section>

		<!-- Social Links Section -->
		{#if user.socialLinks && user.socialLinks.length > 0}
			<section
				class="mx-auto max-w-6xl px-4 py-16 sm:px-2 sm:py-8"
			>
				<div class="text-center">
					<h3
						class="mb-8 text-3xl font-bold"
						style="color: var(--color-theme-4);"
					>
						Connect with {user.tag}
					</h3>
					<div
						class="flex flex-wrap justify-center gap-6 sm:flex-col sm:items-center"
					>
						{#each user.socialLinks as link (link)}
							{@const { name } =
								getSocialMediaInfo(link)}
							<a
								href={link}
								target="_blank"
								rel="noopener noreferrer"
								class="interactive-card group relative overflow-hidden rounded-full px-8 py-4 font-bold text-white shadow-xl transition-all sm:w-full sm:max-w-xs"
								style="background: var(--color-theme-6);"
							>
								<div
									class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20"
								></div>
								<div
									class="relative flex items-center gap-3"
								>
									<div
										class="rounded-full p-2"
										style="background: rgba(255,255,255,0.2);"
									>
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path
												d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"
											/>
										</svg>
									</div>
									{name}
								</div>
							</a>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	{:else}
		<!-- User Not Found Section -->
		<div
			class="from-bg-primary via-bg-secondary to-bg-tertiary flex min-h-screen items-center justify-center bg-gradient-to-br px-4"
		>
			<div
				class="feature-card interactive-card max-w-md rounded-3xl p-12 text-center shadow-2xl"
				style=" border: 2px solid var(--color-theme-5);"
			>
				<div class="mb-6 flex justify-center">
					<div
						class="rounded-full p-6"
						style="background: var(--color-theme-5);"
					>
						<svg
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="white"
						>
							<path
								d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
							/>
						</svg>
					</div>
				</div>
				<h2
					class="mb-4 text-2xl font-bold"
					style="color: var(--color-theme-4);"
				>
					User Not Found
				</h2>
				<p
					class="mb-8 text-lg text-gray-600 dark:text-gray-300"
				>
					The requested user profile could not be
					found.
				</p>
				<a
					href="/u"
					class="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-white transition-all"
					style="background: var(--color-theme-2);"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"
						/>
					</svg>
					Back to Search
				</a>
			</div>
		</div>
	{/if}
</div>

<!-- Custom Styles for Animations -->
<style>
	.floating-orb {
		animation: float 6s ease-in-out infinite;
	}

	.floating-orb:nth-child(2) {
		animation-delay: -2s;
	}

	.floating-orb:nth-child(3) {
		animation-delay: -4s;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(180deg);
		}
	}

	.profile-hero {
		opacity: 0;
	}

	.profile-info > * {
		opacity: 0;
	}

	.feature-card {
		opacity: 0;
	}

	.interactive-card:hover {
		transform: translateY(-5px);
	}

	.action-button:hover {
		transform: translateY(-3px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
	}

	.feature-link:hover {
		transform: scale(1.05);
	}
</style>
