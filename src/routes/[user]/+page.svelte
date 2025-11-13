<script lang="ts">
	import {
		ItemResultsList,
		ItemSearch
	} from '$lib/components/items';
	import Button from '$lib/components/Button.svelte';
	import type { Item } from '$lib/types/item';
	import type { PageProps } from './$types';
	import { md } from '$lib/util/marked';
	import { onMount } from 'svelte';
	import {
		animate,
		createTimeline,
		stagger
	} from 'animejs';
	import { toast } from '$lib/util/toast.svelte';
	import { page } from '$app/state';

	let { data }: PageProps = $props();
	console.log('d', data);
	let {
		u: user,
		c: comparison,
		it: items,
		p: posts_count,
		m: itemSearchData
	} = data as unknown as {
		u: {
			i: string;
			tag: string;
			m?: string;
			avatar?: string;
			age?: number;
			gender?: number;
			description?: string;
			socialLinks: string[];
			phones?: string[];
			emails?: string[];
		};
		c: string;
		it: Array<Item & { i: string }>;
		p?: number;
		m: Record<string, unknown>;
	};

	const phone_numbers = $derived(user?.phones ?? []);
	const email_addresses = $derived(
		user?.emails ?? []
	);

	const other_posts = $derived(
		Boolean(posts_count && posts_count > 0)
	);

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
				`${window.location.origin}/${user?.tag ?? ''}`
			);
			toast.info(
				'Link copied to clipboard!',
				'info',
				2000
			);
		} catch {
			toast.error(
				'Failed to copy link',
				'error',
				3000
			);
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
			if (
				hostname.includes('whatsapp.com') ||
				hostname.includes('wa.me')
			)
				return {
					name: 'WhatsApp',
					faIcon: 'fa-brands fa-whatsapp'
				};
			return {
				name: new URL(url).hostname
					.replace('www.', '')
					.split('.')[0],
				faIcon: 'fa-external-link-alt'
			}; // Generic name, generic icon
		} catch {
			return {
				name: url,
				faIcon: 'fa-external-link-alt'
			}; // Fallback to raw URL, generic icon
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
							class="relative h-32 w-32 overflow-hidden rounded-full shadow-2xl"
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
						class="text-4xl font-semibold sm:text-2xl"
						style="color: var(--color-theme-4);"
					>
						{user.m || user.tag}
					</h1>
					<div
						class="flex items-center justify-center gap-2 text-sm text-white lowercase"
					>
						{page.url.origin}/{user.tag}
						<button
							onclick={async () => {
								try {
									await navigator.clipboard.writeText(
										`${page.url.origin}/${user.tag}`
									);
									toast.info(
										'Link copied to clipboard!',
										'info',
										2000
									);
								} catch {
									toast.error(
										'Failed to copy link',
										'error',
										3000
									);
								}
							}}
							class="text-white"
							aria-label="copy profile link"
						>
							<i class="fas fa-copy"></i>
						</button>
					</div>
					{#if user.socialLinks && user.socialLinks.length > 0}
						<div
							class="flex flex-wrap items-center justify-center gap-3 text-sm text-white lowercase"
						>
							{#each user.socialLinks as link (link)}
								{@const { name, faIcon } =
									getSocialMediaInfo(link)}
								<a
									href={link}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-1 transition hover:text-[var(--color-theme-4)]"
								>
									{#if faIcon}
										<i class="fas {faIcon} text-xs"
										></i>
									{:else}
										<i
											class="fas fa-external-link-alt text-xs"
										></i>
									{/if}
									{name.toLowerCase()}
								</a>
							{/each}
						</div>
					{/if}

					<div
						class="flex flex-wrap justify-center gap-4 sm:flex-col sm:items-center"
					>
						{#if user.show_age}
							<span
								class="interactive-card rounded-full px-6 py-3 font-semibold text-white shadow-lg"
								style="background: var(--color-theme-1);"
							>
								Age: {user.age ?? 'hidden'}
							</span>
						{/if}
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
						{#if user.show_gender}
							<span
								class="interactive-card rounded-full px-6 py-3 font-semibold text-white shadow-lg"
								style="background: var(--color-theme-3);"
							>
								{user.gender === 0
									? 'Male'
									: 'Female'}
							</span>
						{/if}
					</div>

					{#if data.user?.i === user.i}
						<!-- Edit Profile Action -->
						<div class="mt-6 flex justify-center">
							<Button
								href="/~/edit_user"
								text="Edit Your Profile"
								icon="fa-edit"
								variant="primary"
							/>
						</div>
						<div
							class="mt-4 flex flex-wrap items-center justify-center gap-3"
						>
							{#if itemSearchData.total > 0}
								<Button
									href={`/${user.tag}/i`}
									text="view items"
									icon="fa-bag-shopping"
									variant="primary"
								/>
							{/if}
							{#if other_posts}
								<Button
									href={`/${user.tag}/posts`}
									text="view posts"
									icon="fa-newspaper"
									variant="primary"
								/>
							{/if}
						</div>

						{#if !user.description}
							<div
								class="feature-card interactive-card mt-6 rounded-3xl p-8 text-center shadow-2xl"
								style=" border: 2px solid var(--color-theme-5);"
							>
								<div class="mb-4 flex justify-center">
									<div
										class="rounded-full p-4"
										style="background: var(--color-theme-5);"
									>
										<i
											class="fas fa-circle-check"
											style="color: white; font-size: 1.5em;"
										></i>
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
									href="/~/edit_user"
									text="Add Description"
									icon="fa-arrow-right"
									variant="secondary"
								/>
							</div>
						{/if}
					{/if}
					{#if data.user && data.user.i !== user.i}
						<div class="mt-8 space-y-4">
							<div class="flex justify-center">
								<Button
									href={`/${user.tag}/a`}
									text={`chat w ${user.tag} anonymously`}
									icon="fa-comments"
									variant="primary"
								/>
							</div>
							<div class="flex justify-center">
								<Button
									href={`/${user.tag}/c`}
									text={`chat w ${user.tag}`}
									icon="fa-comments"
									variant="primary"
								/>
							</div>
							<div class="flex justify-center">
								<Button
									href="/~/{user.tag}/c?call=video"
									text="Video call"
									icon="fa-video"
									variant="primary"
								/>
							</div>
							<div class="flex justify-center">
								<Button
									href={`/${user.tag}/posts`}
									text="view posts"
									icon="fa-newspaper"
									variant="primary"
								/>
							</div>
							<div class="flex justify-center">
								<Button
									href={`/${user.tag}/i`}
									text="view items"
									icon="fa-bag-shopping"
									variant="primary"
								/>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<section
			class="mx-auto max-w-6xl px-4 py-16 sm:px-2 sm:py-8"
		>
			<h2
				class="mb-8 text-3xl font-bold"
				style="color: var(--color-theme-4);"
			>
				search {user.tag}'s items
			</h2>
			<ItemSearch
				data={{
					...itemSearchData,
					userTag: user.tag
				}}
				showSort={true}
			/>
			{#if items.length > 0}
				<div class="mt-8">
					<ItemResultsList results={items} />
				</div>
			{:else}
				<p
					class="text-center text-sm text-[var(--text-secondary)] lowercase"
				>
					no items yet
				</p>
			{/if}
		</section>

		<!-- Compatibility & Actions Section -->
		<section
			class="mx-auto max-w-6xl px-4 py-16 sm:px-2 sm:py-8"
		>
			{#if data.user && data.user.i !== user.i}
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
								<i
									class="fas fa-heart"
									style="color: white; font-size: 1.2em;"
								></i>
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
			{:else if data.user?.i === user.i}
				<!-- No content for own profile in compatibility section -->
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
							<i
								class="fas fa-user"
								style="color: white; font-size: 1.5em;"
							></i>
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
						href="/~/google"
						text="Sign In to Connect"
						icon="fa-sign-in-alt"
						variant="primary"
					/>
				</div>
			{/if}
		</section>

		<!-- Social Links Section removed per updated design -->
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
						<i
							class="fas fa-user-slash"
							style="color: white; font-size: 2em;"
						></i>
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
					href="/~/u"
					text="Back to Search"
					icon="fa-arrow-left"
					variant="primary"
				/>
			</div>
		</div>
	{/if}

	{#if phone_numbers.length}
		<div
			class="flex flex-wrap items-center justify-center gap-3 text-sm text-white lowercase"
		>
			{#each phone_numbers as phone (phone)}
				<span
					class="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2"
				>
					<i class="fas fa-phone text-xs"></i>
					{phone}
				</span>
			{/each}
		</div>
	{/if}

	{#if email_addresses.length}
		<div
			class="flex flex-wrap items-center justify-center gap-3 text-sm text-white lowercase"
		>
			{#each email_addresses as address (address)}
				<span
					class="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2"
				>
					<i class="fas fa-envelope text-xs"></i>
					{address}
				</span>
			{/each}
		</div>
	{/if}
</div>

<!-- Custom Styles for Animations -->
<style>
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
