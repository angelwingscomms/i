<script lang="ts">
	import {
		ItemResultsList,
		ItemSearch
	} from '$lib/components/items';
	import Button from '$lib/components/Button.svelte';
	import type { Item } from '$lib/types/item';
	import type { ItemSort } from '$lib/util/items/types';
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import {
		animate,
		createTimeline,
		stagger
	} from 'animejs';
	import { toast } from '$lib/util/toast.svelte';
	import { page } from '$app/state';

	type ItemWithId = Item & { i: string };

	let { data }: PageProps = $props();
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
			description?: string;
			wh?: string;
			tg?: string;
			x?: Record<string, string>;
		};
		c: string[];
		it: Array<Item & { i: string }>;
		p?: number;
		m: Record<string, unknown>;
	};

	console.log('user data', data);

	const other_posts = $derived(
		Boolean(posts_count && posts_count > 0)
	);

	let item_query = $state('');
	let item_kind = $state<0 | 1 | undefined>(
		undefined
	);
	let item_sort = $state<ItemSort>('relevance');
	let item_searching = $state(false);
	let filtered_items = $state<ItemWithId[]>([]);

	$effect(() => {
		filtered_items = [...items];
	});

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

	async function handle_item_search() {
		item_searching = true;
		await new Promise((resolve) =>
			setTimeout(resolve, 400)
		);
		let res = items.filter((item: ItemWithId) => {
			const matches_query =
				!item_query ||
				item.n
					?.toLowerCase()
					.includes(item_query.toLowerCase()) ||
				item.a
					?.toLowerCase()
					.includes(item_query.toLowerCase());
			const matches_kind =
				item_kind === undefined ||
				item.k === item_kind;
			return matches_query && matches_kind;
		});
		res.sort((a: ItemWithId, b: ItemWithId) => {
			switch (item_sort) {
				case 'newest':
					return Number(b.d || 0) - Number(a.d || 0);
				case 'oldest':
					return Number(a.d || 0) - Number(b.d || 0);
				case 'name':
					return (a.n || '').localeCompare(b.n || '');
				case 'price':
					return Number(a.p || 0) - Number(b.p || 0);
				default:
					return 0;
			}
		});
		filtered_items = res;
		item_searching = false;
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

					{#if user.x && Object.keys(user.x).length > 0}
						<div
							class="flex flex-wrap items-center justify-center gap-3 text-sm text-white lowercase"
						>
							<!-- Social Links from x object -->
							{#each Object.entries(user.x || {}) as [name, url]}
								{@const {
									name: displayName,
									faIcon
								} = getSocialMediaInfo(url as string)}
								<a
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									class="feature-link flex gap-1 capitalize transition hover:text-[var(--color-theme-4)]"
								>
									{#if faIcon}
										<i class="{faIcon} text-xs"></i>
									{:else}
										<i
											class="fas fa-external-link-alt text-xs"
										></i>
									{/if}
									{displayName.toLowerCase()}
								</a>
							{/each}
						</div>
					{/if}

					<div class="mt-6 flex justify-center">
						<Button
							href="/{user.tag}/live"
							text="view live stream"
							icon="fa-edit"
							variant="primary"
						/>
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
							<Button
								href="/~/items/new"
								text="create item"
								icon="fa-plus"
								variant="primary"
							/>
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
						<div
							class="mt-8 flex flex-wrap justify-center gap-3"
						>
							<Button
								href={`/${user.tag}/a`}
								text={`chat w ${user.tag} anonymously`}
								icon="fa-comments"
								variant="primary"
							/>
							<Button
								href={`/${user.tag}/c`}
								text={`chat w ${user.tag}`}
								icon="fa-comments"
								variant="primary"
							/>
							<Button
								href="/~/{user.tag}/c?call=video"
								text="Video call"
								icon="fa-video"
								variant="primary"
							/>
							<Button
								href={`/${user.tag}/posts`}
								text="view posts"
								icon="fa-newspaper"
								variant="primary"
							/>
							<Button
								href={`/${user.tag}/i`}
								text="view items"
								icon="fa-bag-shopping"
								variant="primary"
							/>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- Compatibility & Actions Section -->
		<section
			class="mx-auto max-w-6xl px-4 py-8 sm:px-2 sm:py-6"
		>
			{#if data.user && data.user.i !== user.i}
				{#if comparison && comparison.length > 0}
					<div class="mb-8 text-center">
						<h3
							class="mb-3 text-xl font-semibold"
							style="color: var(--color-theme-4);"
						>
							what you have in common
						</h3>
						<div
							class="mx-auto flex max-w-3xl flex-wrap justify-center gap-2"
						>
							{#each comparison as commonality}
								<span
									class="rounded-full px-4 py-2 text-sm font-medium text-white shadow-md"
									style="background: var(--color-theme-1);"
								>
									{commonality}
								</span>
							{/each}
						</div>
					</div>
				{:else if comparison && comparison.length === 0}
					<div class="mb-8 text-center">
						<p
							class="text-sm text-gray-600 dark:text-gray-400"
						>
							no similarity between users to show
						</p>
					</div>
				{:else if !user.description}
					<div class="mb-8 text-center">
						<p
							class="text-sm text-gray-600 dark:text-gray-400"
						>
							this user doesn't have a description
							yet. you'll be able to see similarities
							with them when they add a description.
						</p>
					</div>
				{/if}
			{:else if data.user?.i === user.i}
				<!-- No content for own profile in compatibility section -->
			{:else}
				<!-- Login Prompt -->
				<div class="mb-8 text-center">
					<p
						class="mb-4 text-sm font-medium"
						style="color: var(--color-theme-4);"
					>
						join our community to see compatibility
						and start conversations!
					</p>
					<Button
						href="/~/google"
						text="sign in to connect"
						icon="fa-sign-in-alt"
						variant="primary"
					/>
				</div>
			{/if}
		</section>

		{#if items && items.length > 0}
			<section
				class="mx-auto max-w-6xl px-4 py-8 sm:px-2 sm:py-6"
			>
				<h2
					class="mb-6 text-2xl font-bold"
					style="color: var(--color-theme-4);"
				>
					{`${user.tag}'s items`}
				</h2>
				<ItemSearch
					data={{
						...itemSearchData,
						userTag: user.tag
					}}
					showSort={true}
				/>
				{#if filtered_items.length > 0 || item_searching}
					{#if item_searching}
						<div class="flex justify-center py-12">
							<div
								class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-theme-1)]"
							></div>
						</div>
					{:else}
						<div class="mt-6">
							<ItemResultsList
								results={filtered_items}
							/>
						</div>
					{/if}
				{/if}
			</section>
		{/if}

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
