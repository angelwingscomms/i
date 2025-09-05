<script lang="ts">
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { PageProps } from './$types';
	import ChatWithButton from '$lib/components/ChatWithButton.svelte';

	type Item = {
		i: string;
		t?: string;
		d?: string; // original description
		k?: number;
		a?: number;
		q?: string; // description summary
		x?: string[];
		score?: number;
		u?: string;
		s?: string;
	};

	let { data }: PageProps = $props();
	let { i: item, relatedItems } = data as unknown as { i: Item; relatedItems?: Item[] };
	let selectedImageIndex = $state(0);
	let showImageModal = $state(false);

	onMount(() => {
		// Add smooth scroll behavior for anchor links
		document.querySelectorAll('a[href^="#"]').forEach((anchor: Element) => {
			anchor.addEventListener('click', function (this: HTMLAnchorElement, e: Event) {
				e.preventDefault();
				const target = document.querySelector(this.getAttribute('href')!);
				if (target) {
					target.scrollIntoView({ behavior: 'smooth' });
				}
			});
		});
	});

	function openImageModal(index: number) {
		selectedImageIndex = index;
		showImageModal = true;
		document.body.style.overflow = 'hidden';
	}

	function closeImageModal() {
		showImageModal = false;
		document.body.style.overflow = 'auto';
	}

	function nextImage() {
		if (item.x && item.x.length > 0) {
			selectedImageIndex = (selectedImageIndex + 1) % item.x.length;
		}
	}

	function prevImage() {
		if (item.x && item.x.length > 0) {
			selectedImageIndex = selectedImageIndex === 0 ? item.x.length - 1 : selectedImageIndex - 1;
		}
	}

	// Handle keyboard navigation for image modal
	function handleKeydown(e: KeyboardEvent) {
		if (!showImageModal) return;

		switch (e.key) {
			case 'Escape':
				closeImageModal();
				break;
			case 'ArrowRight':
				nextImage();
				break;
			case 'ArrowLeft':
				prevImage();
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>{item.t || 'Item Details'} - Apexlinks</title>
	<meta name="description" content={item.d || 'View item details and connect with the owner'} />
</svelte:head>

<div class="min-h-screen" style="background: var(--bg-primary);">
	<!-- Hero Section with Image Gallery -->
	{#if item.x && item.x.length > 0}
		<div
			class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
		>
			<!-- Subtle animated background elements -->
			<div class="absolute inset-0 opacity-30">
				<div
					class="absolute top-0 -left-4 h-72 w-72 animate-pulse rounded-full bg-purple-500 mix-blend-multiply blur-xl filter"
				></div>
				<div
					class="animation-delay-2000 absolute top-0 -right-4 h-72 w-72 animate-pulse rounded-full bg-pink-500 mix-blend-multiply blur-xl filter"
				></div>
				<div
					class="animation-delay-4000 absolute -bottom-8 left-20 h-72 w-72 animate-pulse rounded-full bg-indigo-500 mix-blend-multiply blur-xl filter"
				></div>
			</div>
			<div
				class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"
			></div>
			<div class="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
				<div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
					<!-- Main Image -->
					<div class="order-2 lg:order-1">
						<div class="group relative">
							<div
								class="group-hover:shadow-3xl relative aspect-square cursor-pointer overflow-hidden rounded-3xl shadow-2xl ring-1 shadow-purple-500/20 ring-white/10 transition-all duration-500 group-hover:shadow-purple-500/30 hover:ring-white/20"
								role="button"
								tabindex="0"
								onclick={() => openImageModal(0)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										openImageModal(0);
									}
								}}
								aria-label="Open image gallery"
							>
								<img
									src={item.x[selectedImageIndex]}
									alt={item.t}
									class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
								/>
								<!-- Subtle overlay on hover -->
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								></div>
							</div>
							<!-- Floating action indicator -->
							<div
								class="absolute -right-3 -bottom-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md"
							>
								<svg
									class="h-6 w-6 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
									></path>
								</svg>
							</div>
						</div>

						<!-- Thumbnail Gallery -->
						{#if item.x.length > 1}
							<div
								class="scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent mt-6 flex gap-3 overflow-x-auto pb-2"
							>
								{#each item.x as image, index}
									<button
										class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 {selectedImageIndex ===
										index
											? 'border-white shadow-lg shadow-purple-500/30'
											: 'border-white/30 hover:border-white/50'}"
										onclick={() => (selectedImageIndex = index)}
									>
										<img
											src={image}
											alt={`${item.t} ${index + 1}`}
											class="h-full w-full object-cover"
										/>
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Item Header Info -->
					<div class="order-1 text-center lg:order-2 lg:text-left">
						<div class="mb-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
							<span
								class="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-md"
							>
								{item.k === 0 ? '🛍️ PRODUCT' : '⚡ SERVICE'}
							</span>
							<span class="text-sm font-medium text-white/70">
								{item.a
									? new Date(item.a).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})
									: 'Date not available'}
							</span>
						</div>

						<h1 class="mb-6 text-4xl leading-tight font-bold tracking-tight text-white lg:text-6xl">
							{item.t}
						</h1>

						{#if item.q}
							<div class="mb-8 text-xl leading-relaxed font-semibold text-white/90 lg:text-2xl">
								{item.q}
							</div>
						{/if}

						<!-- Action Buttons -->
						<div class="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
							<div class="flex-1 sm:flex-none">
								{#if item.u}
									<ChatWithButton href="/u/{item.u}/c" text="💬 Chat with Owner" />
								{/if}
							</div>
							{#if item.u}
								<div class="flex flex-1 flex-col gap-3 sm:flex-none sm:flex-row">
									<a href="/u/{item.u}" class="btn btn-secondary group">
										<span class="transition-transform duration-200 group-hover:scale-110">👤</span>
										<span>View Owner Profile</span>
									</a>
									<a href="/u/{item.u}/i" class="btn btn-secondary group">
										<span class="transition-transform duration-200 group-hover:scale-110">🛍️</span>
										<span>More from Owner</span>
									</a>
								</div>
							{/if}
						</div>

						<!-- Additional Action -->
						<div class="mt-6 border-t border-white/10 pt-6">
							<a
								href="/i/{item.i}/c"
								class="group inline-flex items-center gap-3 text-white/80 transition-colors duration-200 hover:text-white"
							>
								<div
									class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 transition-colors duration-200 group-hover:bg-white/20"
								>
									<span class="text-sm">🤖</span>
								</div>
								<span class="font-medium">Ask AI About This Item</span>
								<svg
									class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									></path>
								</svg>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<!-- No Image Hero Section -->
		<div
			class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
		>
			<!-- Subtle animated background elements -->
			<div class="absolute inset-0 opacity-20">
				<div
					class="absolute top-0 -left-4 h-72 w-72 animate-pulse rounded-full bg-purple-500 mix-blend-multiply blur-xl filter"
				></div>
				<div
					class="animation-delay-2000 absolute top-0 -right-4 h-72 w-72 animate-pulse rounded-full bg-pink-500 mix-blend-multiply blur-xl filter"
				></div>
				<div
					class="animation-delay-4000 absolute -bottom-8 left-20 h-72 w-72 animate-pulse rounded-full bg-indigo-500 mix-blend-multiply blur-xl filter"
				></div>
			</div>
			<div
				class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"
			></div>
			<div class="relative mx-auto max-w-4xl px-6 py-20 text-center lg:px-8 lg:py-28">
				<!-- Decorative icon -->
				<div
					class="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl ring-1 shadow-purple-500/30 ring-white/20"
				>
					<span class="text-4xl">{item.k === 0 ? '🛍️' : '⚡'}</span>
				</div>

				<div class="mb-8 flex flex-wrap items-center justify-center gap-3">
					<span
						class="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-md"
					>
						{item.k === 0 ? '🛍️ PRODUCT' : '⚡ SERVICE'}
					</span>
					<span class="text-sm font-medium text-white/70">
						{item.a
							? new Date(item.a).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})
							: 'Date not available'}
					</span>
				</div>

				<h1 class="mb-6 text-5xl leading-tight font-bold tracking-tight text-white lg:text-6xl">
					{item.t}
				</h1>

				{#if item.q}
					<div
						class="mx-auto mb-10 max-w-2xl text-xl leading-relaxed font-semibold text-white/90 lg:text-2xl"
					>
						{item.q}
					</div>
				{/if}

				<div class="mx-auto flex max-w-2xl flex-col justify-center gap-4 sm:flex-row">
					<div class="flex-1 sm:flex-none">
						<ChatWithButton href="/u/{item.u}/c" text="💬 Chat with Owner" />
					</div>
					<div class="flex flex-1 flex-col gap-3 sm:flex-none sm:flex-row">
						<a href="/u/{item.u}" class="btn btn-secondary group">
							<span class="transition-transform duration-200 group-hover:scale-110">👤</span>
							<span>View Owner Profile</span>
						</a>
						<a href="/u/{item.u}/i" class="btn btn-secondary group">
							<span class="transition-transform duration-200 group-hover:scale-110">🛍️</span>
							<span>More from Owner</span>
						</a>
					</div>
				</div>

				<!-- Additional Action -->
				<div class="mt-8 border-t border-white/10 pt-8">
					<a
						href="/i/{item.i}/c"
						class="group inline-flex items-center gap-3 text-white/80 transition-colors duration-200 hover:text-white"
					>
						<div
							class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 transition-colors duration-200 group-hover:bg-white/20"
						>
							<span class="text-sm">🤖</span>
						</div>
						<span class="font-medium">Ask AI About This Item</span>
						<svg
							class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
							></path>
						</svg>
					</a>
				</div>
			</div>
		</div>
	{/if}

	<!-- Main Content -->
	<div class="relative">
		<!-- Subtle background pattern -->
		<div
			class="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50/50 via-transparent to-purple-50/30"
		></div>
		<div class="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
			<div class="grid gap-12 lg:grid-cols-3 lg:gap-16">
				<!-- Left Column - Description -->
				<div class="space-y-8 lg:col-span-2">
					<div class="card-normal group">
						<div class="mb-8 flex items-center justify-between">
							<h2
								class="flex items-center gap-3 text-2xl font-bold lg:text-3xl"
								style="color: var(--color-theme-4);"
							>
								<div
									class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30"
								>
									<span class="text-white">📄</span>
								</div>
								Description
							</h2>
							<div class="h-8 w-px bg-gradient-to-b from-purple-500/20 to-transparent"></div>
						</div>

						{#if item.d}
							<div
								class="prose prose-lg max-w-none leading-relaxed text-gray-700 dark:text-gray-300"
							>
								{@html marked(item.d)}
							</div>
						{:else}
							<div class="py-16 text-center">
								<div
									class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner"
								>
									<span class="text-3xl">📝</span>
								</div>
								<h3 class="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-400">
									No description provided
								</h3>
								<p class="text-gray-500 dark:text-gray-500">
									The owner hasn't added a description for this item yet.
								</p>
							</div>
						{/if}
					</div>

					<!-- Additional Information -->
					<div class="card-normal group">
						<div class="mb-8 flex items-center justify-between">
							<h2
								class="flex items-center gap-3 text-2xl font-bold lg:text-3xl"
								style="color: var(--color-theme-4);"
							>
								<div
									class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30"
								>
									<span class="text-white">ℹ️</span>
								</div>
								Details
							</h2>
							<div class="h-8 w-px bg-gradient-to-b from-blue-500/20 to-transparent"></div>
						</div>

						<div class="grid gap-8 md:grid-cols-2">
							<div class="space-y-6">
								<div
									class="group/item rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all duration-300 hover:border-purple-500/30 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-700/30"
								>
									<div class="flex items-center justify-between">
										<span
											class="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
											>Type</span
										>
										<div
											class="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-purple-500/30"
										>
											{item.k === 0 ? '🛍️ Product' : '⚡ Service'}
										</div>
									</div>
								</div>

								<div
									class="group/item rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all duration-300 hover:border-purple-500/30 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-700/30"
								>
									<div class="flex items-center justify-between">
										<span
											class="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
											>Posted</span
										>
										<span class="font-bold text-gray-900 dark:text-gray-100">
											{item.a
												? new Date(item.a).toLocaleDateString('en-US', {
														year: 'numeric',
														month: 'long',
														day: 'numeric'
													})
												: 'Date not available'}
										</span>
									</div>
								</div>
							</div>

							<div class="space-y-6">
								{#if item.q}
									<div
										class="group/item rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all duration-300 hover:border-purple-500/30 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-700/30"
									>
										<div class="flex items-center justify-between">
											<span
												class="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
												>Price</span
											>
											<span class="font-bold" style="color: var(--color-theme-1);">
												{item.v ? `${item.v}` : 'Price not available'}
											</span>
										</div>
									</div>
								{/if}

								<div
									class="group/item rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all duration-300 hover:border-purple-500/30 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-700/30"
								>
									<div class="flex items-center justify-between">
										<span
											class="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
											>Item ID</span
										>
										<span
											class="rounded-lg bg-gray-100 px-3 py-1 font-mono text-sm font-bold text-gray-900 dark:bg-gray-800 dark:text-gray-100"
										>
											{item.i}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Right Column - Actions & Quick Info -->
				<div class="lg:col-span-1">
					<div class="sticky top-8 space-y-8">
						<!-- Quick Actions Card -->
						<div class="card-normal group">
							<div class="mb-6 flex items-center justify-between">
								<h3
									class="flex items-center gap-3 text-xl font-bold lg:text-2xl"
									style="color: var(--color-theme-4);"
								>
									<div
										class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30"
									>
										<span class="text-white">⚡</span>
									</div>
									Quick Actions
								</h3>
								<div class="h-8 w-px bg-gradient-to-b from-green-500/20 to-transparent"></div>
							</div>

							<div class="space-y-4">
								<ChatWithButton href="/u/{item.u}/c" text="💬 Chat with Owner" />

								<a href="/u/{item.u}" class="btn btn-secondary group/btn w-full">
									<span class="transition-transform duration-200 group-hover/btn:scale-110">👤</span
									>
									<span>View Owner Profile</span>
								</a>

								<a href="/u/{item.u}/i" class="btn btn-secondary group/btn w-full">
									<span class="transition-transform duration-200 group-hover/btn:scale-110">🛍️</span
									>
									<span>More from Owner</span>
								</a>

								<a href="/i/{item.i}/c" class="btn btn-secondary group/btn w-full">
									<span class="transition-transform duration-200 group-hover/btn:scale-110">🤖</span
									>
									<span>Ask AI About This</span>
								</a>

								<button
									class="btn group/btn w-full"
									style="border: 1px solid var(--color-theme-6); color: var(--color-theme-4);"
									onclick={() =>
										navigator
											.share?.({
												title: item.t,
												text: item.d || '',
												url: window.location.href
											})
											.catch(() => {
												// Fallback to clipboard
												navigator.clipboard.writeText(window.location.href);
											})}
								>
									<span class="transition-transform duration-200 group-hover/btn:scale-110">📤</span
									>
									<span>Share Item</span>
								</button>
							</div>
						</div>

						<!-- Item Stats Card -->
						<div class="card-normal group">
							<div class="mb-6 flex items-center justify-between">
								<h4
									class="flex items-center gap-3 text-lg font-bold"
									style="color: var(--color-theme-4);"
								>
									<div
										class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30"
									>
										<span class="text-white">📊</span>
									</div>
									Stats
								</h4>
								<div class="h-6 w-px bg-gradient-to-b from-orange-500/20 to-transparent"></div>
							</div>

							<div class="space-y-4">


								<div
									class="flex items-center justify-between rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-3 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-700/30"
								>
									<span class="text-sm font-medium text-gray-600 dark:text-gray-400">Age</span>
									<span class="font-bold text-gray-900 dark:text-gray-100">
										{item.a ? Math.ceil((Date.now() - item.a) / (1000 * 60 * 60 * 24)) : '—'}d
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Related Items Section -->
			{#if relatedItems && relatedItems.length > 0}
				<div class="mt-20 lg:mt-24">
					<div class="card-normal group">
						<div class="mb-10 flex items-center justify-between">
							<h2
								class="flex items-center gap-3 text-2xl font-bold lg:text-3xl"
								style="color: var(--color-theme-4);"
							>
								<div
									class="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30"
								>
									<span class="text-white">🔗</span>
								</div>
								More from This Seller
							</h2>
							<div class="h-10 w-px bg-gradient-to-b from-teal-500/20 to-transparent"></div>
						</div>

						<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
							{#each relatedItems as relatedItem (relatedItem.i)}
								<a href="/i/{relatedItem.i}" class="group block no-underline">
									<div
										class="card-hover bg-gradient-to-br from-white to-gray-50/50 p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10 dark:from-gray-800/50 dark:to-gray-700/20"
									>
										<!-- Item Image -->
										<div class="relative mb-6">
											<div
												class="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner dark:from-gray-700 dark:to-gray-600"
											>
												{#if relatedItem.x && relatedItem.x.length > 0}
													<img
														src={relatedItem.x[0]}
														alt={relatedItem.t}
														class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
													/>
												{:else}
													<div
														class="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 text-4xl dark:from-purple-900/20 dark:to-pink-900/20"
													>
														{relatedItem.t?.charAt(0).toUpperCase() ?? '📦'}
													</div>
												{/if}
											</div>

											<!-- Item Type Badge -->
											<div class="absolute -top-2 -right-2">
												<div
													class="rounded-2xl border border-white/20 px-3 py-1 text-xs font-bold shadow-lg backdrop-blur-sm"
													style="background: var(--color-theme-{relatedItem.k === 0
														? '1'
														: '2'})30; color: var(--color-theme-{relatedItem.k === 0 ? '1' : '2'});"
												>
													{relatedItem.k === 0 ? '🛍️ Product' : '⚡ Service'}
												</div>
											</div>

											<!-- Hover overlay -->
											<div
												class="absolute inset-0 rounded-2xl bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
											></div>
										</div>

										<!-- Item Info -->
										<div class="space-y-4">
											<h3
												class="line-clamp-2 text-xl leading-tight font-bold transition-colors duration-200 group-hover:text-purple-600 dark:group-hover:text-purple-400"
												style="color: var(--color-theme-4);"
											>
												{relatedItem.t ?? 'Untitled Item'}
											</h3>

											{#if relatedItem.d}
												<p
													class="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400"
												>
													{relatedItem.d}
												</p>
											{/if}

											<div class="flex items-center justify-between pt-2">
												{#if relatedItem.q}
													<span class="text-lg font-bold" style="color: var(--color-theme-1);">
														{relatedItem.q}
													</span>
												{/if}
												<span class="text-sm font-medium text-gray-500 dark:text-gray-400">
													{relatedItem.a
														? new Date(relatedItem.a).toLocaleDateString('en-US', {
																month: 'short',
																day: 'numeric'
															})
														: ''}
												</span>
											</div>
										</div>
									</div>
								</a>
							{/each}
						</div>

						{#if relatedItems.length >= 6}
							<div class="mt-10 text-center">
								<a
									href="/u/{item.u}/i"
									class="btn btn-secondary group inline-flex items-center gap-3"
								>
									<span class="transition-transform duration-200 group-hover:scale-110">👀</span>
									<span>View All Items from This Seller</span>
									<svg
										class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5l7 7-7 7"
										></path>
									</svg>
								</a>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Image Modal -->
	{#if showImageModal && item.x && item.x.length > 0}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
			role="button"
			tabindex="-1"
			onclick={closeImageModal}
			onkeydown={(e) => {
				if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					closeImageModal();
				}
			}}
			aria-label="Close image modal"
			transition:fade={{ duration: 300 }}
		>
			<div
				class="relative max-h-screen max-w-6xl p-6"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				tabindex="-1"
			>
				<!-- Modal Title (hidden but for accessibility) -->
				<h2 id="modal-title" class="sr-only">Image Gallery - {item.t}</h2>

				<!-- Close button -->
				<button
					class="absolute top-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/20"
					onclick={closeImageModal}
					aria-label="Close image gallery"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>

				<!-- Main image container -->
				<div class="group relative">
					<div class="relative overflow-hidden rounded-3xl shadow-2xl shadow-purple-500/20">
						<img
							src={item.x[selectedImageIndex]}
							alt={`${item.t} ${selectedImageIndex + 1}`}
							class="max-h-[75vh] max-w-full object-contain transition-transform duration-500"
							style="display: block;"
						/>
					</div>

					<!-- Image overlay with subtle gradient -->
					<div
						class="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-black/20 via-transparent to-black/10"
					></div>

					<!-- Navigation arrows -->
					{#if item.x.length > 1}
						<button
							class="absolute top-1/2 left-6 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white/20"
							onclick={(e) => {
								e.stopPropagation();
								prevImage();
							}}
							aria-label="Previous image"
						>
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 19l-7-7 7-7"
								></path>
							</svg>
						</button>

						<button
							class="absolute top-1/2 right-6 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white/20"
							onclick={(e) => {
								e.stopPropagation();
								nextImage();
							}}
							aria-label="Next image"
						>
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path>
							</svg>
						</button>
					{/if}
				</div>

				<!-- Image info bar -->
				<div class="mt-6 flex items-center justify-between">
					<!-- Image counter -->
					{#if item.x.length > 1}
						<div
							class="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md"
						>
							<span class="font-bold">{selectedImageIndex + 1}</span>
							<span>of</span>
							<span>{item.x.length}</span>
						</div>
					{:else}
						<div></div>
					{/if}

					<!-- Image title -->
					<div class="flex-1 text-center">
						<h3 class="text-lg font-semibold text-white">{item.t}</h3>
					</div>

					<!-- Share button -->
					<button
						class="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/20"
						onclick={(e) => {
							e.stopPropagation();
							navigator
								.share?.({
									title: item.t,
									text: item.d || '',
									url: window.location.href
								})
								.catch(() => {
									navigator.clipboard.writeText(window.location.href);
								});
						}}
					>
						Share
					</button>
				</div>

				<!-- Thumbnail navigation -->
				{#if item.x.length > 1}
					<div
						class="scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent mt-6 flex max-w-full justify-center gap-3 overflow-x-auto"
					>
						{#each item.x as image, index}
							<button
								class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-105 {selectedImageIndex ===
								index
									? 'border-white shadow-lg shadow-white/20'
									: 'border-white/30 hover:border-white/50'}"
								onclick={(e) => {
									e.stopPropagation();
									selectedImageIndex = index;
								}}
							>
								<img
									src={image}
									alt={`${item.t} ${index + 1}`}
									class="h-full w-full object-cover"
								/>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<style>
		/* Enhanced prose styling for better typography */
		.prose {
			color: var(--text-primary);
			line-height: 1.8;
			font-size: 1.125rem;
		}

		.prose :global(h1),
		.prose :global(h2),
		.prose :global(h3),
		.prose :global(h4),
		.prose :global(h5),
		.prose :global(h6) {
			color: var(--color-theme-4);
			margin-top: 2em;
			margin-bottom: 1em;
			font-weight: 600;
			line-height: 1.3;
		}

		.prose :global(h1) {
			font-size: 2.25rem;
			font-weight: 700;
		}

		.prose :global(h2) {
			font-size: 1.875rem;
			font-weight: 600;
		}

		.prose :global(h3) {
			font-size: 1.5rem;
			font-weight: 600;
		}

		.prose :global(p) {
			margin-bottom: 1.5em;
			line-height: 1.8;
			color: var(--text-secondary);
		}

		.prose :global(strong) {
			color: var(--color-theme-4);
			font-weight: 700;
		}

		.prose :global(a) {
			color: var(--color-theme-1);
			text-decoration: none;
			font-weight: 500;
			transition: all 0.2s ease;
		}

		.prose :global(a:hover) {
			color: var(--color-theme-2);
			text-decoration: underline;
		}

		.prose :global(blockquote) {
			border-left: 4px solid var(--color-theme-1);
			padding-left: 1.5em;
			margin: 2.5em 0;
			font-style: italic;
			color: var(--color-theme-6);
			background: linear-gradient(135deg, rgba(182, 55, 250, 0.05), rgba(250, 55, 139, 0.05));
			padding: 1.5em 2em;
			border-radius: 0 1em 1em 0;
			position: relative;
		}

		.prose :global(blockquote::before) {
			content: '"';
			font-size: 4rem;
			color: var(--color-theme-1);
			position: absolute;
			top: 0.5rem;
			left: 0.5rem;
			opacity: 0.3;
		}

		.prose :global(code) {
			background: linear-gradient(135deg, rgba(182, 55, 250, 0.1), rgba(248, 137, 250, 0.1));
			padding: 0.25em 0.5em;
			border-radius: 0.5em;
			font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
			font-size: 0.875em;
			font-weight: 500;
			border: 1px solid rgba(182, 55, 250, 0.2);
		}

		.prose :global(pre) {
			background: linear-gradient(135deg, rgba(10, 10, 10, 0.9), rgba(20, 20, 20, 0.9));
			border: 1px solid rgba(248, 137, 250, 0.3);
			border-radius: 1em;
			padding: 1.5em;
			overflow-x: auto;
			margin: 2em 0;
			box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
			position: relative;
		}

		.prose :global(pre::before) {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 3px;
			background: linear-gradient(
				90deg,
				var(--color-theme-1),
				var(--color-theme-2),
				var(--color-theme-3)
			);
			border-radius: 1em 1em 0 0;
		}

		.prose :global(ul),
		.prose :global(ol) {
			margin: 1.5em 0;
			padding-left: 2em;
		}

		.prose :global(li) {
			margin-bottom: 0.75em;
			line-height: 1.7;
		}

		/* Enhanced scrollbar styling */
		.overflow-x-auto::-webkit-scrollbar,
		.scrollbar-thin::-webkit-scrollbar {
			height: 6px;
		}

		.overflow-x-auto::-webkit-scrollbar-track,
		.scrollbar-thin::-webkit-scrollbar-track {
			background: rgba(255, 255, 255, 0.1);
			border-radius: 3px;
		}

		.overflow-x-auto::-webkit-scrollbar-thumb,
		.scrollbar-thin::-webkit-scrollbar-thumb {
			background: rgba(255, 255, 255, 0.3);
			border-radius: 3px;
		}

		.overflow-x-auto::-webkit-scrollbar-thumb:hover,
		.scrollbar-thin::-webkit-scrollbar-thumb:hover {
			background: rgba(255, 255, 255, 0.5);
		}

		/* Animation delays for staggered animations */
		.animation-delay-2000 {
			animation-delay: 2s;
		}

		.animation-delay-4000 {
			animation-delay: 4s;
		}

		/* Line clamp utility */
		.line-clamp-2 {
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}

		.line-clamp-3 {
			display: -webkit-box;
			-webkit-line-clamp: 3;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}

		/* Enhanced focus states */
		button:focus-visible,
		a:focus-visible {
			outline: 2px solid var(--color-theme-1);
			outline-offset: 2px;
			border-radius: 0.5em;
		}

		/* Subtle text shadows for better readability */
		.text-shadow-sm {
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		}

		/* Enhanced transitions for smoother interactions */
		* {
			transition-property: color, background-color, border-color, transform, opacity, box-shadow;
			transition-duration: 200ms;
			transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		}

		/* Improved button hover states */
		.btn:hover:not(:disabled) {
			transform: translateY(-2px);
			box-shadow: 0 10px 25px rgba(182, 55, 250, 0.3);
		}

		/* Enhanced card hover effects */
		.card-hover:hover {
			transform: translateY(-4px);
			box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		}

		/* Accessibility improvements */
		@media (prefers-reduced-motion: reduce) {
			* {
				transition-duration: 0ms !important;
			}

			@keyframes * {
				animation-duration: 0ms !important;
			}
		}

		/* Dark mode specific enhancements */
		[data-theme='dark'] {
			.prose :global(blockquote) {
				background: linear-gradient(135deg, rgba(182, 55, 250, 0.1), rgba(250, 55, 139, 0.1));
			}

			.prose :global(code) {
				background: linear-gradient(135deg, rgba(182, 55, 250, 0.15), rgba(248, 137, 250, 0.15));
			}
		}
	</style>
</div>
