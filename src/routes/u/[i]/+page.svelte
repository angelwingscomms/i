<script lang="ts">
	import { marked } from 'marked';
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
	async function copyLink() {
		try {
			await navigator.clipboard.writeText(`${window.location.origin}/u/${user?.i ?? ''}`);
			copied = true;
			setTimeout(() => (copied = false), 1200);
		} catch {
			// Do nothing on error
		}
	}
	function getSocialMediaInfo(url: string): { name: string; iconClass: string | null } {
		try {
			const hostname = new URL(url).hostname;
			if (hostname.includes('facebook.com'))
				return { name: 'Facebook', iconClass: 'icon-facebook' };
			if (hostname.includes('twitter.com') || hostname.includes('x.com'))
				return { name: 'X', iconClass: 'icon-x' };
			if (hostname.includes('instagram.com'))
				return { name: 'Instagram', iconClass: 'icon-instagram' };
			if (hostname.includes('linkedin.com'))
				return { name: 'LinkedIn', iconClass: 'icon-linkedin' };
			if (hostname.includes('github.com')) return { name: 'GitHub', iconClass: 'icon-github' };
			if (hostname.includes('youtube.com')) return { name: 'YouTube', iconClass: 'icon-youtube' };
			if (hostname.includes('tiktok.com')) return { name: 'TikTok', iconClass: 'icon-tiktok' };
			if (hostname.includes('discord.gg')) return { name: 'Discord', iconClass: 'icon-discord' };
			if (hostname.includes('pinterest.com'))
				return { name: 'Pinterest', iconClass: 'icon-pinterest' };
			if (hostname.includes('reddit.com')) return { name: 'Reddit', iconClass: 'icon-reddit' };
			if (hostname.includes('spotify.com')) return { name: 'Spotify', iconClass: 'icon-spotify' };
			if (hostname.includes('twitch.tv')) return { name: 'Twitch', iconClass: 'icon-twitch' };
			if (hostname.includes('medium.com')) return { name: 'Medium', iconClass: 'icon-medium' };
			if (hostname.includes('snapchat.com'))
				return { name: 'Snapchat', iconClass: 'icon-snapchat' };
			if (hostname.includes('telegram.org'))
				return { name: 'Telegram', iconClass: 'icon-telegram' };
			return { name: new URL(url).hostname.replace('www.', '').split('.')[0], iconClass: null }; // Generic name, no specific icon
		} catch {
			return { name: url, iconClass: null }; // Fallback to raw URL, no specific icon
		}
	}
</script>

<svelte:head>
	<title>{user?.tag || 'User'} - User Profile</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-2 sm:py-4">
	{#if user}
		<div class="mb-8 sm:p-6">
			<header class="mb-8 border-b-2 border-gray-100 pb-6 text-center dark:border-gray-900">
				<div class="mb-3 flex items-center justify-center">
					<div class="h-20 w-20 overflow-hidden rounded-full bg-gray-800">
						{#if user.avatar}
							<img src={user.avatar} alt={user.tag} class="h-full w-full object-cover" />
						{/if}
					</div>
				</div>
				<h1 class="text-primary mb-2 text-3xl font-bold sm:text-2xl">{user.tag}</h1>
				<div class="flex flex-wrap justify-center gap-8 sm:flex-col sm:items-center sm:gap-4">
					<span
						class="rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 dark:border-gray-900 dark:bg-transparent dark:text-gray-300"
						>age: {user.age}</span
					>
					<span
						class="rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 dark:border-gray-900 dark:bg-transparent dark:text-gray-300"
					>
						{user.gender === 0 ? 'male' : 'female'}
					</span>
				</div>
				<p class="mb-1 text-sm text-gray-500 dark:text-gray-400">share profile</p>
				<div class="mt-4 flex items-center justify-center gap-3">
					<div class="rounded-full bg-[#e9d5ff] px-4 py-2 text-sm text-gray-900 dark:text-black">
						{#if typeof window !== 'undefined'}{window.location.origin}/u/{user.i}{/if}
					</div>
					<button class="btn-primary btn-sm" onclick={copyLink}>copy</button>
					{#if copied}<span class="text-sm text-emerald-400">copied!</span>{/if}
				</div>
			</header>

			{#if !is_own_profile && data.user}
				{#if comparison}
					<div
						class="mb-8 rounded-xl border border-blue-200 p-6 sm:p-4 dark:border-gray-900 dark:bg-transparent"
					>
						<h2
							class="mb-4 flex items-center gap-2 text-xl font-semibold text-sky-700 dark:text-sky-400"
						>
							what you have in common
						</h2>
						<div class="leading-relaxed text-blue-800 dark:text-blue-200">
							{@html marked.parse(comparison)}
						</div>
					</div>
				{:else if !user.description}
					<div
						class="mb-8 rounded-lg border border-amber-400 p-8 text-center dark:border-gray-900 dark:bg-transparent"
					>
						<p class="m-0 text-amber-900 dark:text-amber-100">
							This user doesn't have a description yet. You'll be able to see similarities with them
							when they put a description of themselves.
						</p>
					</div>
				{/if}
			{/if}

			{#if data.user && !is_own_profile}
				<div class=" mb-8 flex justify-center">
					<a
						href="/u/{user.i}/c"
						class="flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white no-underline shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg sm:px-6 sm:py-3.5 sm:text-base"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2M6,9H18V11H6V9M14,14H6V12H14V14M18,8H6V6H18V8Z"
							/>
						</svg>
						start chat
					</a>
				</div>
			{:else if is_own_profile}
				<div class="mb-8 flex justify-center">
					<a
						href="/edit_user"
						class="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white no-underline shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg sm:px-6 sm:py-3.5 sm:text-base"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
							/>
						</svg>
						Edit Profile
					</a>
				</div>
				{#if !user.description}
					<div
						class="mb-8 rounded-lg border border-amber-400 p-8 text-center dark:border-gray-900 dark:bg-transparent"
					>
						<p class="m-0 text-amber-900 dark:text-amber-100">
							You don't have a description yet. <a
								href="/edit_user"
								class="font-semibold text-blue-700 no-underline hover:underline dark:text-blue-400"
								>Update your description</a
							> to complete your profile.
						</p>
					</div>
				{/if}
			{:else}
				<div
					class="mb-8 rounded-lg border border-amber-400 p-8 text-center dark:border-gray-900 dark:bg-transparent"
				>
					<p class="m-0 text-amber-900 dark:text-amber-100">
						please <a
							href="/google"
							class="font-semibold text-blue-700 no-underline hover:underline dark:text-blue-400"
							>log in</a
						> to see compatibility and start chatting.
					</p>
				</div>
			{/if}

			{#if user.socialLinks && user.socialLinks.length > 0}
				<div class="mt-8 border-t-2 border-gray-100 pt-8 text-center sm:pt-6 dark:border-gray-900">
					<h3 class="text-accent mb-6 text-xl font-semibold">Connect with {user.tag}</h3>
					<div class="flex flex-wrap justify-center gap-4 sm:flex-col sm:items-center">
						{#each user.socialLinks as link (link)}
							{@const { name, iconClass } = getSocialMediaInfo(link)}
							<a
								href={link}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 rounded-lg border border-cyan-300 px-5 py-3 font-medium text-cyan-800 no-underline transition-all hover:-translate-y-0.5 sm:w-full sm:max-w-xs sm:justify-center dark:border-gray-900 dark:bg-transparent dark:text-cyan-400 dark:hover:bg-gray-900 {iconClass ||
									''}"
							>
								{name}
							</a>
						{/each}
					</div>
				</div>
			{/if}

			<!-- <div class="mt-8">
				<h3 class="text-gray-700 text-xl font-semibold mb-4">About {user.tag}</h3>
				<div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
					<p class="text-gray-600 leading-relaxed">{user.description}</p>
				</div>
			</div> -->
		</div>
	{:else}
		<!-- fallback when user not found -->
		<div
			class="mb-8 rounded-lg border border-gray-200 p-8 text-center dark:border-gray-900 dark:bg-transparent"
		>
			<h2 class="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">user not found</h2>
			<p class="text-gray-600 dark:text-gray-400">the requested user profile could not be found.</p>
			<a href="/" class="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400"
				>go back to search</a
			>
		</div>
	{/if}

	<!-- <div class="flex justify-center">
		<a href="/" class="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 no-underline rounded-lg font-medium transition-all border border-gray-300 hover:bg-gray-200 hover:-translate-x-0.5">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
				<path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
			</svg>
			Back to Search
		</a>
	</div> -->
</div>
