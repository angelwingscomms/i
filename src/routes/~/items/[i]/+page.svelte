<script lang="ts">
	import { md } from '$lib/util/marked';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { PageProps } from './$types';
	import Button from '$lib/components/Button.svelte';

	let { data }: PageProps = $props();
	let { user, i: item } = data;
	console.log('Loaded item:', item);
	let selectedImageIndex = $state(0);
	let showImageModal = $state(false);

	onMount(() => {
		// Add smooth scroll behavior for anchor links
		document
			.querySelectorAll('a[href^="#"]')
			.forEach((anchor: Element) => {
				anchor.addEventListener(
					'click',
					function (
						this: HTMLAnchorElement,
						e: Event
					) {
						e.preventDefault();
						const target = document.querySelector(
							this.getAttribute('href')!
						);
						if (target) {
							target.scrollIntoView({
								behavior: 'smooth'
							});
						}
					}
				);
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
			selectedImageIndex =
				(selectedImageIndex + 1) % item.x.length;
		}
	}

	function prevImage() {
		if (item.x && item.x.length > 0) {
			selectedImageIndex =
				selectedImageIndex === 0
					? item.x.length - 1
					: selectedImageIndex - 1;
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
	<title>{item.n || 'item details'} - apexlinks</title>
	{#if item.a}
		<meta name="about this item" content={item.a} />
	{/if}
</svelte:head>

<div
	class="min-h-screen"
	style="background: var(--bg-primary);"
>
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
			<div
				class="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24"
			>
				<div
					class="flex flex-col items-center gap-12 lg:flex-row lg:gap-16"
				>
					<!-- Main Image -->
					<div class="order-2 lg:order-1">
						<div class="group relative">
							<div
								class="group-hover:shadow-3xl relative aspect-square cursor-pointer overflow-hidden rounded-3xl shadow-2xl ring-1 shadow-purple-500/20 ring-white/10 transition-all duration-500 group-hover:shadow-purple-500/30 hover:ring-white/20"
								role="button"
								tabindex="0"
								onclick={() => openImageModal(0)}
								onkeydown={(e) => {
									if (
										e.key === 'Enter' ||
										e.key === ' '
									) {
										e.preventDefault();
										openImageModal(0);
									}
								}}
								aria-label="Open image gallery"
							>
								<img
									src={item.x[selectedImageIndex]}
									alt={item.n}
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
								<i
									class="fas fa-search h-6 w-6 text-white"
								></i>
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
										onclick={() =>
											(selectedImageIndex = index)}
									>
										<img
											src={image}
											alt={`${item.n} ${index + 1}`}
											class="h-full w-full object-cover"
										/>
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Item Header Info -->
					<div
						class="order-1 text-center lg:order-2 lg:text-left"
					>
			<div
				class="mb-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
			>
							<span
								class="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-md"
							>
								<i
									class={`fas fa-${item.k === 0 ? 'shopping-bag' : 'bolt'} mr-1`}
								></i>{item.k === 0
									? 'PRODUCT'
									: 'SERVICE'}
							</span>
				<span
					class="text-sm font-medium text-white/70"
				>
					{item.d
						? new Date(
							item.d
						).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})
						: 'date not available'}
				</span>
						</div>

						<h1
							class="mb-6 text-4xl leading-tight font-bold tracking-tight text-white lg:text-6xl"
						>
							{item.n}
						</h1>

						{#if item.q}
							<div
								class="mb-8 text-xl leading-relaxed font-semibold text-white/90 lg:text-2xl"
							>
								{item.q}
							</div>
						{/if}

						<!-- Action Buttons -->
						<div
							class="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
						>
							{#if item.u}
								<div
									class="flex flex-1 flex-col gap-3 sm:flex-none sm:flex-row"
								>
									<Button
										href="/~/{item.ownerTag}/c"
										text="Chat with Owner"
										icon="fa-comments"
										variant="primary"
									/>
									<Button
										href="/~/{item.ownerTag}"
										variant="secondary"
										icon="fa-user"
										text="View Owner Profile"
									/>
									<Button
										href="/~/{item.ownerTag}/i"
										variant="secondary"
										icon="fa-shopping-bag"
										text="More from Owner"
									/>
								</div>
							{/if}
							{#if user && user.i === item.u}
								<div class="flex gap-3">
									<Button
										href={`/items/${item.i}/edit`}
										variant="secondary"
										icon="fa-edit"
										text="edit"
									/>
								</div>
							{/if}
						</div>

						<!-- Additional Action -->
						<div
							class="mt-6 justify-center gap-3 border-t border-white/10 pt-6"
						>
							<Button
								href="/~/items/{item.i}/c"
								variant="secondary"
								icon="fa-robot"
								text="Ask AI About This Item"
							/>
							<Button
								onclick={() =>
									navigator
										.share?.({
											title: item.n,
											text: item.a || '',
											url: window.location.href
										})
										.catch(() => {
											// Fallback to clipboard
											navigator.clipboard.writeText(
												window.location.href
											);
										})}
								variant="secondary"
								icon="fa-share"
								text="Share Item"
								wide={true}
							/>
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
			<div
				class="relative mx-auto max-w-4xl px-6 py-20 text-center lg:px-8 lg:py-28"
			>
				<!-- Decorative icon -->
				<div
					class="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl ring-1 shadow-purple-500/30 ring-white/20"
				>
					<i
						class={`fas fa-${item.k === 0 ? 'shopping-bag' : 'bolt'} text-4xl text-white`}
					></i>
				</div>

				<div
					class="mb-8 flex flex-wrap items-center justify-center gap-3"
				>
					<span
						class="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-md"
					>
						<i
							class={`fas fa-${item.k === 0 ? 'shopping-bag' : 'bolt'} mr-1`}
						></i>{item.k === 0
							? 'PRODUCT'
							: 'SERVICE'}
					</span>
					<span
						class="text-sm font-medium text-white/70"
					>
						{item.a
							? new Date(item.d).toLocaleDateString(
									'en-US',
									{
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									}
								)
							: 'Date not available'}
					</span>
				</div>

				<h1
					class="mb-6 text-5xl leading-tight font-bold tracking-tight text-white lg:text-6xl"
				>
					{item.n}
				</h1>

				{#if item.q}
					<div
						class="mx-auto mb-10 max-w-2xl text-xl leading-relaxed font-semibold text-white/90 lg:text-2xl"
					>
						{item.q}
					</div>
				{/if}

				<div
					class="mx-auto flex max-w-2xl flex-col justify-center gap-4 sm:flex-row"
				>
					<div class="flex-1 sm:flex-none">
						<Button
							href="/~/{item.ownerTag}/c"
							text="Chat with Owner"
							icon="fa-comments"
							variant="primary"
						/>
					</div>
					<div
						class="flex flex-1 flex-col gap-3 sm:flex-none sm:flex-row"
					>
						<Button
							href="/~/{item.ownerTag}"
							variant="secondary"
							icon="fa-user"
							text="View Owner Profile"
						/>
						<Button
							href="/~/{item.ownerTag}/i"
							variant="secondary"
							icon="fa-shopping-bag"
							text="More from Owner"
						/>
					</div>
					{#if user && user.i === item.u}
						<div class="flex gap-3">
							<Button
								href={`/items/${item.i}/edit`}
								variant="secondary"
								icon="fa-edit"
								text="edit"
							/>
						</div>
					{/if}
				</div>

				<!-- Additional Action -->
			<div
				class="mt-8 flex flex-wrap justify-center gap-3 border-t border-white/10 pt-8"
			>
				<Button
					href="/~/items/{item.i}/c"
					variant="secondary"
					icon="fa-robot"
					text="Ask AI About This Item"
				/>
				{#if item.ownerWhatsapp}
					<a
						href={`https://wa.me/${item.ownerWhatsapp.replace(/[^0-9]/g, '')}`}
						class="btn-secondary"
						aria-label="message on whatsapp"
						target="_blank"
						rel="noopener"
					>
						<i class="fab fa-whatsapp"></i> whatsapp
					</a>
				{/if}
				{#if item.ownerDiscord}
					<a
						href={item.ownerDiscord}
						class="btn-secondary"
						target="_blank"
						rel="noopener"
					>
						<i class="fab fa-discord"></i> discord
					</a>
				{/if}
				<Button
					onclick={() =>
						navigator
							.share?.({
								title: item.n,
								text: item.a || '',
								url: window.location.href
							})
							.catch(() => {
								// Fallback to clipboard
								navigator.clipboard.writeText(
									window.location.href
								);
							})}
					variant="secondary"
					icon="fa-share"
					text="share item"
					wide={true}
				/>
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
		<div
			class="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20"
		>
			<div
				class="grid gap-12 lg:grid-cols-3 lg:gap-16"
			>
				<!-- Left Column - Description -->
				<div class="space-y-8 lg:col-span-2">
					<div class="card-normal group">
			<div class="mb-8 flex items-center justify-between">
				<h2
					class="text-2xl font-bold lg:text-3xl"
					style="color: var(--color-theme-4);"
				>
					description
				</h2>
			</div>

						{#if item.d}
							<div
								class="prose prose-lg max-w-none leading-relaxed text-gray-700 dark:text-gray-300"
							>
								{@html md(item.a || '')}
							</div>
						{:else}
							<div class="py-16 text-center">
								<div
									class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner"
								>
									<i class="fas fa-file-alt text-3xl"
									></i>
								</div>
								<h3
									class="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-400"
								>
									No description provided
								</h3>
								<p
									class="text-gray-500 dark:text-gray-500"
								>
									The owner hasn't added a description
									for this item yet.
								</p>
							</div>
						{/if}
					</div>

					<!-- Additional Information -->
					<div class="card-normal group">
			<div class="mb-8 flex items-center justify-between">
				<h2
					class="text-2xl font-bold lg:text-3xl"
					style="color: var(--color-theme-4);"
				>
					details
				</h2>
			</div>

						<div class="grid gap-8 md:grid-cols-2">
							<div class="space-y-6">
								<div
									class="group/item rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all duration-300 hover:border-purple-500/30 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-700/30"
								>
									<div
										class="flex items-center justify-between"
									>
										<span
											class="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
											>Type</span
										>
										<div
											class="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-purple-500/30"
										>
											<i
												class={`fas fa-${item.k === 0 ? 'shopping-bag' : 'bolt'} mr-1`}
											></i>{item.k === 0
												? 'Product'
												: 'Service'}
										</div>
									</div>
								</div>

				<div
					class="group/item rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all duration-300 hover:border-purple-500/30 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-700/30"
				>
					<div class="flex items-center justify-between">
						<span class="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
							price
						</span>
						<span class="font-bold text-gray-900 dark:text-gray-100">
							{#if item.p !== undefined}
								{item.c ?? ''} {item.p.toLocaleString()}
							{:else}
								not provided
							{/if}
						</span>
					</div>
				</div>

								<div
									class="group/item rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all duration-300 hover:border-purple-500/30 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-700/30"
								>
					<div
						class="flex items-center justify-between"
					>
						<span
							class="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
							>posted</span
						>
						<span
							class="font-bold text-gray-900 dark:text-gray-100"
						>
							{item.d
								? new Date(
									item.d
								).toLocaleDateString(
									'en-US',
									{
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									}
								)
								: 'date not available'}
						</span>
					</div>
								</div>
							</div>

							<div class="space-y-6">
								{#if item.v}
									<div
										class="group/item rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all duration-300 hover:border-purple-500/30 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-700/30"
									>
										<div
											class="flex items-center justify-between"
										>
											<span
												class="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
												>Price</span
											>
											<span
												class="font-bold"
												style="color: var(--color-theme-1);"
											>
												{item.v
													? `${item.v} ${item.m || '$'}`
													: 'Price not available'}
											</span>
										</div>
									</div>
								{/if}

								<div
									class="group/item rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 transition-all duration-300 hover:border-purple-500/30 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-700/30"
								>
									<div
										class="flex items-center justify-between"
									>
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
			</div>

			<!-- Related Items Section (commented out) -->
			<!--
			{#if relatedItems && relatedItems.length > 0}
				<div class="mt-20 lg:mt-24">
					<div class="card-normal group">
						<div
							class="mb-10 flex items-center justify-between"
						>
							<h2
								class="flex items-center gap-3 text-2xl font-bold lg:text-3xl"
								style="color: var(--color-theme-4);"
							>
								<div
									class="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30"
								>
									<i class="fas fa-link text-white"
									></i>
								</div>
								More from This Seller
							</h2>
							<div
								class="h-10 w-px bg-gradient-to-b from-teal-500/20 to-transparent"
							></div>
						</div>

						<div
							class="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
						>
							{#each relatedItems as relatedItem (relatedItem.i)}
								<a
									href="/~/items/{relatedItem.i}"
									class="group block no-underline"
								>
									<div
										class="card-hover bg-gradient-to-br from-white to-gray-50/50 p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10 dark:from-gray-800/50 dark:to-gray-700/20"
									>
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
														{relatedItem.t
															?.charAt(0)
															.toUpperCase() ?? '📦'}
													</div>
												{/if}
											</div>

											<div
												class="absolute -top-2 -right-2"
											>
												<div
													class="rounded-2xl border border-white/20 px-3 py-1 text-xs font-bold shadow-lg backdrop-blur-sm"
													style="background: var(--color-theme-{relatedItem.k ===
													0
														? '1'
														: '2'})30; color: var(--color-theme-{relatedItem.k ===
													0
														? '1'
														: '2'});"
												>
													<i
														class={`fas fa-${relatedItem.k === 0 ? 'shopping-bag' : 'bolt'} mr-1`}
													></i>{relatedItem.k === 0
														? 'Product'
														: 'Service'}
												</div>
											</div>

											<div
												class="absolute inset-0 rounded-2xl bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
											></div>
										</div>

										<div class="space-y-4">
											<h3
												class="line-clamp-2 text-xl leading-tight font-bold transition-colors duration-200 group-hover:text-purple-600 dark:group-hover:text-purple-400"
												style="color: var(--color-theme-4);"
											>
												{relatedItem.t ??
													'Untitled Item'}
											</h3>

											{#if relatedItem.d}
												<p
													class="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400"
												>
													{relatedItem.d}
												</p>
											{/if}

											<div
												class="flex items-center justify-between pt-2"
											>
												{#if relatedItem.q}
													<span
														class="text-lg font-bold"
														style="color: var(--color-theme-1);"
													>
														{relatedItem.q}
													</span>
												{/if}
												<span
													class="text-sm font-medium text-gray-500 dark:text-gray-400"
												>
													{relatedItem.a
														? new Date(
																relatedItem.a
															).toLocaleDateString(
																'en-US',
																{
																	month: 'short',
																	day: 'numeric'
																}
															)
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
								<Button
							href="/~/{item.ownerTag}/i"
									variant="secondary"
									icon="fa-eye"
									text="View All Items from This Seller"
								/>
							</div>
						{/if}
					</div>
				</div>
			{/if}
			-->
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
				if (
					e.key === 'Escape' ||
					e.key === 'Enter' ||
					e.key === ' '
				) {
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
				<h2 id="modal-title" class="sr-only">
					Image Gallery - {item.n}
				</h2>

				<!-- Close button -->
				<button
					class="absolute top-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/20"
					onclick={closeImageModal}
					aria-label="Close image gallery"
				>
					<i class="fas fa-times h-6 w-6"></i>
				</button>

				<!-- Main image container -->
				<div class="group relative">
					<div
						class="relative overflow-hidden rounded-3xl shadow-2xl shadow-purple-500/20"
					>
						<img
							src={item.x[selectedImageIndex]}
							alt={`${item.n} ${selectedImageIndex + 1}`}
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
							<i class="fas fa-chevron-left h-6 w-6"
							></i>
						</button>

						<button
							class="absolute top-1/2 right-6 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white/20"
							onclick={(e) => {
								e.stopPropagation();
								nextImage();
							}}
							aria-label="Next image"
						>
							<i class="fas fa-chevron-right h-6 w-6"
							></i>
						</button>
					{/if}
				</div>

				<!-- Image info bar -->
				<div
					class="mt-6 flex items-center justify-between"
				>
					<!-- Image counter -->
					{#if item.x.length > 1}
						<div
							class="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md"
						>
							<span class="font-bold"
								>{selectedImageIndex + 1}</span
							>
							<span>of</span>
							<span>{item.x.length}</span>
						</div>
					{:else}
						<div></div>
					{/if}

					<!-- Image title -->
					<div class="flex-1 text-center">
						<h3
							class="text-lg font-semibold text-white"
						>
							{item.n}
						</h3>
					</div>

					<!-- Share button -->
					<button
						class="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/20"
						onclick={(e) => {
							e.stopPropagation();
							navigator
								.share?.({
									title: item.n,
									text: item.a || '',
									url: window.location.href
								})
								.catch(() => {
									navigator.clipboard.writeText(
										window.location.href
									);
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
									alt={`${item.n} ${index + 1}`}
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
			background: linear-gradient(
				135deg,
				rgba(182, 55, 250, 0.05),
				rgba(250, 55, 139, 0.05)
			);
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
			background: linear-gradient(
				135deg,
				rgba(182, 55, 250, 0.1),
				rgba(248, 137, 250, 0.1)
			);
			padding: 0.25em 0.5em;
			border-radius: 0.5em;
			font-family:
				'SF Mono', 'Monaco', 'Menlo', 'Consolas',
				monospace;
			font-size: 0.875em;
			font-weight: 500;
			border: 1px solid rgba(182, 55, 250, 0.2);
		}

		.prose :global(pre) {
			background: linear-gradient(
				135deg,
				rgba(10, 10, 10, 0.9),
				rgba(20, 20, 20, 0.9)
			);
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
			transition-property:
				color, background-color, border-color,
				transform, opacity, box-shadow;
			transition-duration: 200ms;
			transition-timing-function: cubic-bezier(
				0.4,
				0,
				0.2,
				1
			);
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
				background: linear-gradient(
					135deg,
					rgba(182, 55, 250, 0.1),
					rgba(250, 55, 139, 0.1)
				);
			}

			.prose :global(code) {
				background: linear-gradient(
					135deg,
					rgba(182, 55, 250, 0.15),
					rgba(248, 137, 250, 0.15)
				);
			}
		}
	</style>
</div>
