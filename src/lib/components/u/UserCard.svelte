<script lang="ts">
	import type { SocialLink } from '$lib/types';

type Result = {
		i: string;
		t: string;
		a?: number;
		g?: number;
		av?: string;
		score?: number;
		on?: number;
		ic?: boolean;
		x?: SocialLink[]; // social links with favicons
		xo?: SocialLink[]; // legacy social links
	};

	let { u } = $props<{ u: Result }>();

	function matchPercent(score?: number) {
		if (typeof score !== 'number') return null;
		const pct = Math.max(0, Math.min(1, score)) * 100;
		return Math.round(pct);
	}

	function getPlatformIcon(url: string): string | null {
		try {
			const hostname = new URL(url).hostname;
			if (hostname.includes('facebook.com')) return 'fa-facebook';
			if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'fa-x-twitter';
			if (hostname.includes('instagram.com')) return 'fa-instagram';
			if (hostname.includes('linkedin.com')) return 'fa-linkedin';
			if (hostname.includes('github.com')) return 'fa-github';
			if (hostname.includes('youtube.com')) return 'fa-youtube';
			if (hostname.includes('tiktok.com')) return 'fa-tiktok';
			if (hostname.includes('discord.gg')) return 'fa-discord';
			if (hostname.includes('twitch.tv')) return 'fa-twitch';
			if (hostname.includes('reddit.com')) return 'fa-reddit';
			if (hostname.includes('pinterest.com')) return 'fa-pinterest';
			if (hostname.includes('snapchat.com')) return 'fa-snapchat';
			if (hostname.includes('telegram.org')) return 'fa-telegram';
			if (hostname.includes('whatsapp.com')) return 'fa-whatsapp';
			if (hostname.includes('signal.org')) return 'fa-signal';
			return null;
		} catch {
			return null;
		}
	}

	function getLinkNameFromUrl(url: string): string {
		try {
			const hostname = new URL(url).hostname;
			if (hostname.includes('facebook.com')) return 'Facebook';
			if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'X';
			if (hostname.includes('instagram.com')) return 'Instagram';
			if (hostname.includes('linkedin.com')) return 'LinkedIn';
			if (hostname.includes('github.com')) return 'GitHub';
			if (hostname.includes('youtube.com')) return 'YouTube';
			if (hostname.includes('tiktok.com')) return 'TikTok';
			if (hostname.includes('discord.gg')) return 'Discord';
			if (hostname.includes('twitch.tv')) return 'Twitch';
			if (hostname.includes('reddit.com')) return 'Reddit';
			if (hostname.includes('pinterest.com')) return 'Pinterest';
			if (hostname.includes('snapchat.com')) return 'Snapchat';
			if (hostname.includes('bluesky.app')) return 'Bluesky';
			if (hostname.includes('threads.net')) return 'Threads';
			return hostname;
		} catch {
			return 'Link';
		}
	}

	const p = matchPercent(u.score);
</script>

<a
	class="user-card group block no-underline"
	href={`/${u.t}`}
>
	<div
		class="flex items-center gap-4 rounded-2xl p-4 transition-all duration-300"
		style="background: transparent; border: 1px solid var(--color-theme-6);"
	>
		<!-- Avatar -->
		<div class="relative flex-shrink-0">
			<div
				class="h-12 w-12 overflow-hidden rounded-full"
			>
				{#if u.av}
					<img
						src={u.av}
						alt={u.t}
						class="h-full w-full object-cover"
					/>
				{:else}
					<div
						class="flex h-full w-full items-center justify-center text-lg font-bold"
						style="background: transparent; color: var(--text-primary);"
					>
						{u.t.charAt(0).toUpperCase()}
					</div>
				{/if}
			</div>
		</div>

		<!-- User Info -->
		<div class="min-w-0 flex-1">
			<div class="flex items-center justify-between">
				<h3
					class="truncate text-lg font-bold transition-transform group-hover:scale-105"
					style="color: var(--color-theme-4);"
				>
					{u.t}
				</h3>
				{#if p !== null}
					<span
						class="ml-2 rounded-full px-2 py-1 text-xs font-bold"
						style="background: transparent; border: 1px solid {p >=
						80
							? 'var(--color-theme-1)'
							: p >= 60
								? 'var(--color-theme-2)'
								: p >= 40
									? 'var(--color-theme-3)'
									: 'var(--color-theme-6)'}; color: {p >=
						80
							? 'var(--color-theme-1)'
							: p >= 60
								? 'var(--color-theme-2)'
								: p >= 40
									? 'var(--color-theme-3)'
									: 'var(--color-theme-6)'};"
					>
						{p}%
					</span>
				{/if}
			</div>

			<!-- Details -->
			<div
				class="mt-1 flex items-center gap-3 text-sm"
			>
				<span style="color: var(--color-theme-1);">
					{u.a ?? '?'} years
				</span>
				<span style="color: var(--color-theme-2);">
					{u.g === 0
						? 'Male'
						: u.g === 1
							? 'Female'
							: 'Other'}
				</span>
			</div>
		</div>

			<!-- Social Links -->
			{#if u.x || u.xo}
				<div class="mt-2 flex flex-wrap gap-2">
					{#each u.x || [] as link}
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-all hover:bg-[var(--color-theme-6)]"
							style="background: transparent; border: 1px solid var(--color-theme-6);"
						>
							{#if link.ico}
								<img
									src={link.ico}
									alt={link.name}
									class="h-3 w-3 rounded-full"
									onerror={() => {
										// Fallback to platform icon if favicon fails to load
										const target = e.target as HTMLImageElement;
										target.style.display = 'none';
									}}
								/>
							{:else}
								<i
									class={`fas ${getPlatformIcon(link.url) || 'fa-link'}`}
									style="color: var(--color-theme-6); font-size: 0.65rem;"
								/>
							{/if}
							<span style="color: var(--color-theme-6);">
								{link.name}
							</span>
						</a>
					{/each}
					{#each u.xo || [] as link}
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-all hover:bg-[var(--color-theme-6)]"
							style="background: transparent; border: 1px solid var(--color-theme-6);"
						>
							<i
								class={`fas ${getPlatformIcon(link.url) || 'fa-link'}`}
								style="color: var(--color-theme-6); font-size: 0.65rem;"
							/>
							<span style="color: var(--color-theme-6);">
								{getLinkNameFromUrl(link.url)}
							</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Arrow -->
		<div class="flex-shrink-0">
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="currentColor"
				style="color: var(--color-theme-6);"
				class="transition-transform group-hover:translate-x-1"
			>
				<path
					d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
				/>
			</svg>
		</div>
	</div>
</a>
