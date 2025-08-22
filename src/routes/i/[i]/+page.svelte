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
	<title>{item.t || 'Item Details'} - AngelWings</title>
	<meta name="description" content={item.d || 'View item details and connect with the owner'} />
</svelte:head>

<div class="min-h-screen" style="background: var(--bg-primary);">
	<!-- Hero Section with Image Gallery -->
	{#if item.x && item.x.length > 0}
		<div class="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
			<!-- Subtle animated background elements -->
			<div class="absolute inset-0 opacity-30">
				<div class="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
				<div class="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
				<div class="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
			</div>
			<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
			<div class="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
				<div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
					<!-- Main Image -->
					<div class="order-2 lg:order-1">
						<div class="relative group">
							<div
								class="aspect-square rounded-3xl overflow-hidden cursor-pointer relative shadow-2xl shadow-purple-500/20 ring-1 ring-white/10 hover:ring-white/20 transition-all duration-500 group-hover:shadow-purple-500/30 group-hover:shadow-3xl"
								role="button"
								tabindex="0"
								onclick={() => openImageModal(0)}
								onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openImageModal(0); } }}
								aria-label="Open image gallery"
							>
								<img
									src={item.x[selectedImageIndex]}
									alt={item.t}
									class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
								/>
								<!-- Subtle overlay on hover -->
								<div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>
							<!-- Floating action indicator -->
							<div class="absolute -bottom-3 -right-3 w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center ring-1 ring-white/20">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
								</svg>
							</div>
						</div>

						<!-- Thumbnail Gallery -->
						{#if item.x.length > 1}
							<div class="flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
								{#each item.x as image, index}
									<button
										class="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 {selectedImageIndex === index ? 'border-white shadow-lg shadow-purple-500/30' : 'border-white/30 hover:border-white/50'}"
										onclick={() => selectedImageIndex = index}
									>
										<img src={image} alt={`${item.t} ${index + 1}`} class="w-full h-full object-cover" />
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Item Header Info -->
					<div class="order-1 lg:order-2 text-center lg:text-left">
						<div class="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
							<span
								class="px-4 py-2 rounded-2xl text-sm font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-white/90"
							>
								{item.k === 0 ? '🛍️ PRODUCT' : '⚡ SERVICE'}
							</span>
							<span class="text-white/70 text-sm font-medium">
								{item.a ? new Date(item.a).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								}) : 'Date not available'}
							</span>
						</div>

						<h1 class="text-4xl lg:text-6xl font-bold mb-6 leading-tight text-white tracking-tight">
							{item.t}
						</h1>

						{#if item.q}
							<div class="text-xl lg:text-2xl font-semibold mb-8 text-white/90 leading-relaxed">
								{item.q}
							</div>
						{/if}

						<!-- Action Buttons -->
						<div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
							<div class="flex-1 sm:flex-none">
								<ChatWithButton href="/u/{item.u}/c" text="💬 Chat with Owner" />
							</div>
							<div class="flex flex-col sm:flex-row gap-3 flex-1 sm:flex-none">
								<a
									href="/u/{item.u}"
									class="btn btn-secondary group"
								>
									<span class="group-hover:scale-110 transition-transform duration-200">👤</span>
									<span>View Owner Profile</span>
								</a>
								<a
									href="/u/{item.u}/i"
									class="btn btn-secondary group"
								>
									<span class="group-hover:scale-110 transition-transform duration-200">🛍️</span>
									<span>More from Owner</span>
								</a>
							</div>
						</div>

						<!-- Additional Action -->
						<div class="mt-6 pt-6 border-t border-white/10">
							<a
								href="/i/{item.i}/c"
								class="inline-flex items-center gap-3 text-white/80 hover:text-white transition-colors duration-200 group"
							>
								<div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
									<span class="text-sm">🤖</span>
								</div>
								<span class="font-medium">Ask AI About This Item</span>
								<svg class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
								</svg>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<!-- No Image Hero Section -->
		<div class="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
			<!-- Subtle animated background elements -->
			<div class="absolute inset-0 opacity-20">
				<div class="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
				<div class="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
				<div class="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
			</div>
			<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
			<div class="relative max-w-4xl mx-auto px-6 lg:px-8 py-20 lg:py-28 text-center">
				<!-- Decorative icon -->
				<div class="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30 ring-1 ring-white/20">
					<span class="text-4xl">{item.k === 0 ? '🛍️' : '⚡'}</span>
				</div>

				<div class="flex flex-wrap items-center justify-center gap-3 mb-8">
					<span
						class="px-4 py-2 rounded-2xl text-sm font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-white/90"
					>
						{item.k === 0 ? '🛍️ PRODUCT' : '⚡ SERVICE'}
					</span>
					<span class="text-white/70 text-sm font-medium">
						{item.a ? new Date(item.a).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						}) : 'Date not available'}
					</span>
				</div>

				<h1 class="text-5xl lg:text-6xl font-bold mb-6 text-white tracking-tight leading-tight">
					{item.t}
				</h1>

				{#if item.q}
					<div class="text-xl lg:text-2xl font-semibold mb-10 text-white/90 leading-relaxed max-w-2xl mx-auto">
						{item.q}
					</div>
				{/if}

				<div class="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
					<div class="flex-1 sm:flex-none">
						<ChatWithButton href="/u/{item.u}/c" text="💬 Chat with Owner" />
					</div>
					<div class="flex flex-col sm:flex-row gap-3 flex-1 sm:flex-none">
						<a
							href="/u/{item.u}"
							class="btn btn-secondary group"
						>
							<span class="group-hover:scale-110 transition-transform duration-200">👤</span>
							<span>View Owner Profile</span>
						</a>
						<a
							href="/u/{item.u}/i"
							class="btn btn-secondary group"
						>
							<span class="group-hover:scale-110 transition-transform duration-200">🛍️</span>
							<span>More from Owner</span>
						</a>
					</div>
				</div>

				<!-- Additional Action -->
				<div class="mt-8 pt-8 border-t border-white/10">
					<a
						href="/i/{item.i}/c"
						class="inline-flex items-center gap-3 text-white/80 hover:text-white transition-colors duration-200 group"
					>
						<div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
							<span class="text-sm">🤖</span>
						</div>
						<span class="font-medium">Ask AI About This Item</span>
						<svg class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
						</svg>
					</a>
				</div>
			</div>
		</div>
	{/if}

	<!-- Main Content -->
	<div class="relative">
		<!-- Subtle background pattern -->
		<div class="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-purple-50/30 -z-10"></div>
		<div class="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
			<div class="grid lg:grid-cols-3 gap-12 lg:gap-16">
				<!-- Left Column - Description -->
				<div class="lg:col-span-2 space-y-8">
					<div class="card-normal group">
						<div class="flex items-center justify-between mb-8">
							<h2 class="text-2xl lg:text-3xl font-bold flex items-center gap-3" style="color: var(--color-theme-4);">
								<div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
									<span class="text-white">📄</span>
								</div>
								Description
							</h2>
							<div class="w-px h-8 bg-gradient-to-b from-purple-500/20 to-transparent"></div>
						</div>

						{#if item.d}
							<div class="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
								{@html marked(item.d)}
							</div>
						{:else}
							<div class="text-center py-16">
								<div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
									<span class="text-3xl">📝</span>
								</div>
								<h3 class="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No description provided</h3>
								<p class="text-gray-500 dark:text-gray-500">The owner hasn't added a description for this item yet.</p>
							</div>
						{/if}
					</div>

					<!-- Additional Information -->
					<div class="card-normal group">
						<div class="flex items-center justify-between mb-8">
							<h2 class="text-2xl lg:text-3xl font-bold flex items-center gap-3" style="color: var(--color-theme-4);">
								<div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
									<span class="text-white">ℹ️</span>
								</div>
								Details
							</h2>
							<div class="w-px h-8 bg-gradient-to-b from-blue-500/20 to-transparent"></div>
						</div>

						<div class="grid md:grid-cols-2 gap-8">
							<div class="space-y-6">
								<div class="group/item p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
									<div class="flex justify-between items-center">
										<span class="font-semibold text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide">Type</span>
										<div class="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-500/30">
											{item.k === 0 ? '🛍️ Product' : '⚡ Service'}
										</div>
									</div>
								</div>

								<div class="group/item p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
									<div class="flex justify-between items-center">
										<span class="font-semibold text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide">Posted</span>
										<span class="font-bold text-gray-900 dark:text-gray-100">
											{item.a ? new Date(item.a).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'long',
												day: 'numeric'
											}) : 'Date not available'}
										</span>
									</div>
								</div>
							</div>

							<div class="space-y-6">
								{#if item.q}
									<div class="group/item p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
										<div class="flex justify-between items-center">
											<span class="font-semibold text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide">Price/Quantity</span>
											<span class="font-bold" style="color: var(--color-theme-1);">
												{item.q}
											</span>
										</div>
									</div>
								{/if}

								<div class="group/item p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
									<div class="flex justify-between items-center">
										<span class="font-semibold text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide">Item ID</span>
										<span class="font-mono text-sm font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
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
							<div class="flex items-center justify-between mb-6">
								<h3 class="text-xl lg:text-2xl font-bold flex items-center gap-3" style="color: var(--color-theme-4);">
									<div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
										<span class="text-white">⚡</span>
									</div>
									Quick Actions
								</h3>
								<div class="w-px h-8 bg-gradient-to-b from-green-500/20 to-transparent"></div>
							</div>

							<div class="space-y-4">
								<ChatWithButton href="/u/{item.u}/c" text="💬 Chat with Owner" />

								<a
									href="/u/{item.u}"
									class="btn btn-secondary w-full group/btn"
								>
									<span class="group-hover/btn:scale-110 transition-transform duration-200">👤</span>
									<span>View Owner Profile</span>
								</a>

								<a
									href="/u/{item.u}/i"
									class="btn btn-secondary w-full group/btn"
								>
									<span class="group-hover/btn:scale-110 transition-transform duration-200">🛍️</span>
									<span>More from Owner</span>
								</a>

								<a
									href="/i/{item.i}/c"
									class="btn btn-secondary w-full group/btn"
								>
									<span class="group-hover/btn:scale-110 transition-transform duration-200">🤖</span>
									<span>Ask AI About This</span>
								</a>

								<button
									class="btn w-full group/btn"
									style="border: 1px solid var(--color-theme-6); color: var(--color-theme-4);"
									onclick={() => navigator.share?.({
										title: item.t,
										text: item.d || '',
										url: window.location.href
									}).catch(() => {
										// Fallback to clipboard
										navigator.clipboard.writeText(window.location.href);
									})}
								>
									<span class="group-hover/btn:scale-110 transition-transform duration-200">📤</span>
									<span>Share Item</span>
								</button>
							</div>
						</div>

						<!-- Item Stats Card -->
						<div class="card-normal group">
							<div class="flex items-center justify-between mb-6">
								<h4 class="text-lg font-bold flex items-center gap-3" style="color: var(--color-theme-4);">
									<div class="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
										<span class="text-white">📊</span>
									</div>
									Stats
								</h4>
								<div class="w-px h-6 bg-gradient-to-b from-orange-500/20 to-transparent"></div>
							</div>

							<div class="space-y-4">
								<div class="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 border border-gray-200/50 dark:border-gray-700/50">
									<span class="font-medium text-gray-600 dark:text-gray-400 text-sm">Views</span>
									<span class="font-bold text-gray-900 dark:text-gray-100">—</span>
								</div>
								<div class="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 border border-gray-200/50 dark:border-gray-700/50">
									<span class="font-medium text-gray-600 dark:text-gray-400 text-sm">Saves</span>
									<span class="font-bold text-gray-900 dark:text-gray-100">—</span>
								</div>
								<div class="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 border border-gray-200/50 dark:border-gray-700/50">
									<span class="font-medium text-gray-600 dark:text-gray-400 text-sm">Age</span>
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
					<div class="flex items-center justify-between mb-10">
						<h2 class="text-2xl lg:text-3xl font-bold flex items-center gap-3" style="color: var(--color-theme-4);">
							<div class="w-12 h-12 rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
								<span class="text-white">🔗</span>
							</div>
							More from This Seller
						</h2>
						<div class="w-px h-10 bg-gradient-to-b from-teal-500/20 to-transparent"></div>
					</div>

					<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{#each relatedItems as relatedItem (relatedItem.i)}
							<a href="/i/{relatedItem.i}" class="group block no-underline">
								<div class="card-hover p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-700/20">
									<!-- Item Image -->
									<div class="relative mb-6">
										<div class="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 shadow-inner">
											{#if relatedItem.x && relatedItem.x.length > 0}
												<img
													src={relatedItem.x[0]}
													alt={relatedItem.t}
													class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
												/>
											{:else}
												<div class="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
													{relatedItem.t?.charAt(0).toUpperCase() ?? '📦'}
												</div>
											{/if}
										</div>

										<!-- Item Type Badge -->
										<div class="absolute -top-2 -right-2">
											<div
												class="px-3 py-1 rounded-2xl text-xs font-bold shadow-lg backdrop-blur-sm border border-white/20"
												style="background: var(--color-theme-{relatedItem.k === 0 ? '1' : '2'})30; color: var(--color-theme-{relatedItem.k === 0 ? '1' : '2'});"
											>
												{relatedItem.k === 0 ? '🛍️ Product' : '⚡ Service'}
											</div>
										</div>

										<!-- Hover overlay -->
										<div class="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
									</div>

									<!-- Item Info -->
									<div class="space-y-4">
										<h3 class="font-bold text-xl leading-tight line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200" style="color: var(--color-theme-4);">
											{relatedItem.t ?? 'Untitled Item'}
										</h3>

										{#if relatedItem.d}
											<p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
												{relatedItem.d}
											</p>
										{/if}

										<div class="flex items-center justify-between pt-2">
											{#if relatedItem.q}
												<span class="font-bold text-lg" style="color: var(--color-theme-1);">
													{relatedItem.q}
												</span>
											{/if}
											<span class="text-gray-500 dark:text-gray-400 text-sm font-medium">
												{relatedItem.a ? new Date(relatedItem.a).toLocaleDateString('en-US', {
													month: 'short',
													day: 'numeric'
												}) : ''}
											</span>
										</div>
									</div>
								</div>
							</a>
						{/each}
					</div>

					{#if relatedItems.length >= 6}
						<div class="text-center mt-10">
							<a
								href="/u/{item.u}/i"
								class="btn btn-secondary inline-flex items-center gap-3 group"
							>
								<span class="group-hover:scale-110 transition-transform duration-200">👀</span>
								<span>View All Items from This Seller</span>
								<svg class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
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
		<div class="relative max-w-6xl max-h-screen p-6" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
			<!-- Modal Title (hidden but for accessibility) -->
			<h2 id="modal-title" class="sr-only">Image Gallery - {item.t}</h2>

			<!-- Close button -->
			<button
				class="absolute top-6 right-6 z-20 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:scale-105 ring-1 ring-white/20"
				onclick={closeImageModal}
				aria-label="Close image gallery"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>

			<!-- Main image container -->
			<div class="relative group">
				<div class="relative overflow-hidden rounded-3xl shadow-2xl shadow-purple-500/20">
					<img
						src={item.x[selectedImageIndex]}
						alt={`${item.t} ${selectedImageIndex + 1}`}
						class="max-w-full max-h-[75vh] object-contain transition-transform duration-500"
						style="display: block;"
					/>
				</div>

				<!-- Image overlay with subtle gradient -->
				<div class="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none"></div>

				<!-- Navigation arrows -->
				{#if item.x.length > 1}
					<button
						class="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:scale-110 ring-1 ring-white/20 shadow-lg"
						onclick={(e) => { e.stopPropagation(); prevImage(); }}
						aria-label="Previous image"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
						</svg>
					</button>

					<button
						class="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:scale-110 ring-1 ring-white/20 shadow-lg"
						onclick={(e) => { e.stopPropagation(); nextImage(); }}
						aria-label="Next image"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
						</svg>
					</button>
				{/if}
			</div>

			<!-- Image info bar -->
			<div class="mt-6 flex items-center justify-between">
				<!-- Image counter -->
				{#if item.x.length > 1}
					<div class="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md text-white text-sm font-medium ring-1 ring-white/20">
						<span class="font-bold">{selectedImageIndex + 1}</span>
						<span>of</span>
						<span>{item.x.length}</span>
					</div>
				{:else}
					<div></div>
				{/if}

				<!-- Image title -->
				<div class="text-center flex-1">
					<h3 class="text-white font-semibold text-lg">{item.t}</h3>
				</div>

				<!-- Share button -->
				<button
					class="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md text-white text-sm font-medium hover:bg-white/20 transition-all duration-200 hover:scale-105 ring-1 ring-white/20"
					onclick={(e) => {
						e.stopPropagation();
						navigator.share?.({
							title: item.t,
							text: item.d || '',
							url: window.location.href
						}).catch(() => {
							navigator.clipboard.writeText(window.location.href);
						});
					}}
				>
					Share
				</button>
			</div>

			<!-- Thumbnail navigation -->
			{#if item.x.length > 1}
				<div class="mt-6 flex justify-center gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent max-w-full">
					{#each item.x as image, index}
						<button
							class="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 {selectedImageIndex === index ? 'border-white shadow-lg shadow-white/20' : 'border-white/30 hover:border-white/50'}"
							onclick={(e) => { e.stopPropagation(); selectedImageIndex = index; }}
						>
							<img src={image} alt={`${item.t} ${index + 1}`} class="w-full h-full object-cover" />
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
		background: linear-gradient(90deg, var(--color-theme-1), var(--color-theme-2), var(--color-theme-3));
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
		background: rgba(255,255,255,0.1);
		border-radius: 3px;
	}

	.overflow-x-auto::-webkit-scrollbar-thumb,
	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: rgba(255,255,255,0.3);
		border-radius: 3px;
	}

	.overflow-x-auto::-webkit-scrollbar-thumb:hover,
	.scrollbar-thin::-webkit-scrollbar-thumb:hover {
		background: rgba(255,255,255,0.5);
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
