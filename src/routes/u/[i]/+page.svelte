<script lang="ts">
	import {md} from '$lib/util/marked';
	import { onMount } from 'svelte';
	import {
		animate,
		createTimeline,
		stagger
	} from 'animejs';
	import type { PageProps } from './$types';
	import Button from '$lib/components/Button.svelte';

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
				'.profile-info > *',
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
		faIcon: string | null;
	} {
		try {
			const hostname = new URL(url).hostname;
			if (hostname.includes('facebook.com'))
				return {
					name: 'Facebook',
					faIcon: 'fa-facebook'
				};
			if (
				hostname.includes('twitter.com') ||
				hostname.includes('x.com')
			)
				return { name: 'X', faIcon: 'fa-x-twitter' };
			if (hostname.includes('instagram.com'))
				return {
					name: 'Instagram',
					faIcon: 'fa-instagram'
				};
			if (hostname.includes('linkedin.com'))
				return {
					name: 'LinkedIn',
					faIcon: 'fa-linkedin'
				};
			if (hostname.includes('github.com'))
				return {
					name: 'GitHub',
					faIcon: 'fa-github'
				};
			if (hostname.includes('youtube.com'))
				return {
					name: 'YouTube',
					faIcon: 'fa-youtube'
				};
			if (hostname.includes('tiktok.com'))
				return {
					name: 'TikTok',
					faIcon: 'fa-tiktok'
				};
			if (hostname.includes('discord.gg'))
				return {
					name: 'Discord',
					faIcon: 'fa-discord'
				};
			if (hostname.includes('pinterest.com'))
				return {
					name: 'Pinterest',
					faIcon: 'fa-pinterest'
				};
			if (hostname.includes('reddit.com'))
				return {
					name: 'Reddit',
					faIcon: 'fa-reddit'
				};
			if (hostname.includes('spotify.com'))
				return {
					name: 'Spotify',
					faIcon: 'fa-spotify'
				};
			if (hostname.includes('twitch.tv'))
				return {
					name: 'Twitch',
					faIcon: 'fa-twitch'
				};
			if (hostname.includes('medium.com'))
				return {
					name: 'Medium',
					faIcon: 'fa-medium'
				};
			if (hostname.includes('snapchat.com'))
				return {
					name: 'Snapchat',
					faIcon: 'fa-snapchat'
				};
			if (hostname.includes('telegram.org'))
				return {
					name: 'Telegram',
					faIcon: 'fa-telegram'
				};
			return {
				name: new URL(url).hostname
					.replace('www.', '')
					.split('.')[0],
				faIcon: 'fa-external-link-alt'
			}; // Generic name, generic icon
		} catch {
			return { name: url, faIcon: 'fa-external-link-alt' }; // Fallback to raw URL, generic icon
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
					class="profile-avatar flex justify-center"
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
						<!-- <span
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
							</div>
						</span> -->
						<span
							class="interactive-card rounded-full px-6 py-3 font-semibold text-white shadow-lg"
							style="background: var(--color-theme-3);"
						>
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
							<Button
								onclick={copyLink}
								text={copied ? '✓ Copied!' : 'Copy Link'}
								variant="secondary"
							/>
						</div>
					</div>
					{#if !is_own_profile && data.user}
						<div class="mt-8 space-y-4">
							<div class="flex justify-center">
								<Button
									href={`/u/${user.i}/a`}
									text={`chat w ${user.tag} anonymously`}
									icon="fa-comments"
									variant="primary"
								/>
							</div>
							<div class="flex justify-center">
								<Button
									href={`/u/${user.i}/c`}
									text={`chat w ${user.tag}`}
									icon="fa-comments"
									variant="primary"
								/>
							</div>
							<div class="flex justify-center">
								<Button
									href="/u/{user.i}/c?call=video"
									text="Video call"
									icon="fa-video"
									variant="primary"
								/>
							</div>
						</div>
					{/if}
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
								<i class="fas fa-heart" style="color: white; font-size: 1.2em;"></i>
							</div>
							What You Have in Common
						</h2>
						<div
							class="prose prose-lg max-w-none leading-relaxed"
							style="color: var(--color-theme-4);"
						>
							{@html md(comparison)}
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
			{:else if is_own_profile}
				<!-- Edit Profile Action -->
				<div class="mb-12 flex justify-center">
					<Button
						href="/edit_user"
						text="Edit Your Profile"
						icon="fa-edit"
						variant="primary"
					/>
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
								<i class="fas fa-circle-check" style="color: white; font-size: 1.5em;"></i>
							</div>
						</div>
						<p
							class="mb-4 text-lg font-medium"
							style="color: var(--color-theme-5);"
						>
							Complete your profile to unlock all
							features!
						</p>
						<Button
							href="/edit_user"
							text="Add Description"
							icon="fa-arrow-right"
							variant="secondary"
						/>
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
							<i class="fas fa-user" style="color: white; font-size: 1.5em;"></i>
						</div>
					</div>
					<p
						class="mb-6 text-lg font-medium"
						style="color: var(--color-theme-4);"
					>
						Join our community to see compatibility
						and start conversations!
					</p>
					<Button
						href="/google"
						text="Sign In to Connect"
						icon="fa-sign-in-alt"
						variant="primary"
					/>
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
							<i class="fas fa-bag-shopping" style="color: white; font-size: 1.5em;"></i>
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
						<Button
							href="/i/create"
							text="Browse Items"
							icon="fa-arrow-right"
							variant="secondary"
						/>
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
							<i class="fas fa-location-dot" style="color: white; font-size: 1.5em;"></i>
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
						<Button
							href="/i/search_nearby"
							text="Search Nearby"
							icon="fa-arrow-right"
							variant="secondary"
						/>
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
							<i class="fas fa-comments" style="color: white; font-size: 1.5em;"></i>
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
						<Button
							href="/r"
							text="Join Rooms"
							icon="fa-arrow-right"
							variant="secondary"
						/>
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
							<i class="fas fa-users" style="color: white; font-size: 1.5em;"></i>
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
						<Button
							href="/u"
							text="explore Users"
							icon="fa-arrow-right"
							variant="secondary"
						/>
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
							<i class="fas fa-robot" style="color: white; font-size: 1.5em;"></i>
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
						<Button
							href="/i"
							text="Try AI Chat"
							icon="fa-arrow-right"
							variant="secondary"
						/>
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
							<i class="fas fa-comment-dots" style="color: white; font-size: 1.5em;"></i>
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
						<Button
							href="/u"
							text="Start Chatting"
							icon="fa-arrow-right"
							variant="secondary"
						/>
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
							{@const { name, faIcon } =
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
										{#if faIcon}
											<i class="fas {faIcon}"></i>
										{:else}
											<i class="fas fa-external-link-alt"></i>
										{/if}
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
						<i class="fas fa-user-slash" style="color: white; font-size: 2em;"></i>
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
				<Button
					href="/u"
					text="Back to Search"
					icon="fa-arrow-left"
					variant="primary"
				/>
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
