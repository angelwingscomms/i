<script lang="ts">
	export let data;

	$: ({ user, comparison, isLoggedIn, isOwnProfile } = data);

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
		} catch (e) {
			return { name: url, iconClass: null }; // Fallback to raw URL, no specific icon
		}
	}
</script>

<svelte:head>
	<title>{user.tag} - User Profile</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-2 sm:py-4">
	<div class="card-large mb-8 sm:p-6">
		<header class="mb-8 border-b-2 border-gray-100 pb-6 text-center">
			<h1 class="text-primary mb-4 text-4xl font-bold sm:text-3xl">{user.tag}</h1>
			<div class="flex flex-wrap justify-center gap-8 sm:flex-col sm:items-center sm:gap-4">
				<span
					class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 font-medium text-gray-700"
					>Age: {user.age}</span
				>
				<span
					class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 font-medium text-gray-700"
				>
					{user.gender === 0 ? 'Male' : 'Female'}
				</span>
			</div>
		</header>

		{#if comparison && isLoggedIn && !isOwnProfile}
			<div class="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-6 sm:p-4">
				<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-sky-700">
					What You Have in Common
				</h2>
				<div class="leading-relaxed text-blue-800">
					<p class="m-0">{comparison}</p>
				</div>
			</div>
		{/if}

		{#if isLoggedIn && !isOwnProfile}
			<!-- <div class="flex justify-center mb-8">
				<a href="/user/{user.tag}/chat" class="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white no-underline rounded-xl font-semibold text-lg transition-all shadow-md hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg sm:px-6 sm:py-3.5 sm:text-base">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2M6,9H18V11H6V9M14,14H6V12H14V14M18,8H6V6H18V8Z"
						/>
					</svg>
					Start Chat
				</a>
			</div> -->
		{:else if isOwnProfile}
			<div class="mb-8 flex justify-center">
				<a
					href="/edit_user/{user.tag}"
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
		{:else}
			<div class="mb-8 rounded-lg border border-amber-400 bg-amber-100 p-8 text-center">
				<p class="m-0 text-amber-900">
					Please <a href="/google" class="font-semibold text-blue-700 no-underline hover:underline"
						>log in</a
					> to see compatibility and start chatting.
				</p>
			</div>
		{/if}

		{#if user.socialLinks && user.socialLinks.length > 0}
			<div class="mt-8 border-t-2 border-gray-100 pt-8 text-center sm:pt-6">
				<h3 class="text-accent mb-6 text-xl font-semibold">Connect with {user.tag}</h3>
				<div class="flex flex-wrap justify-center gap-4 sm:flex-col sm:items-center">
					{#each user.socialLinks as link (link)}
						{@const { name, iconClass } = getSocialMediaInfo(link)}
						<a
							href={link}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-lg border border-cyan-300 bg-cyan-100 px-5 py-3 font-medium text-cyan-800 no-underline transition-all hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-md sm:w-full sm:max-w-xs sm:justify-center {iconClass ||
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

	<!-- <div class="flex justify-center">
		<a href="/" class="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 no-underline rounded-lg font-medium transition-all border border-gray-300 hover:bg-gray-200 hover:-translate-x-0.5">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
				<path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
			</svg>
			Back to Search
		</a>
	</div> -->
</div>
