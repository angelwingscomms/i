<script lang="ts">
	import { marked } from 'marked';
	import type { PageProps } from './$types';
	import ChatWithButton from '$lib/components/ChatWithButton.svelte';

	let { data }: PageProps = $props();
	let { i: item } = data;
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
	<!-- Item Header -->
	<div class="mb-8">
		<div class="flex items-center justify-between mb-4">
			<span class="text-sm font-medium rounded-full px-3 py-1" 
				style="border: 1px solid var(--color-theme-{item.k === 0 ? '1' : '2'}); color: var(--color-theme-{item.k === 0 ? '1' : '2'});">
				{item.k === 0 ? '🛍️ Product' : '⚡ Service'}
			</span>
			<span class="text-xs text-gray-500">
				{new Date(item.a).toLocaleDateString()}
			</span>
		</div>
		<h1 class="text-3xl font-bold mb-2" style="color: var(--color-theme-4);">
			{item.t}
		</h1>
	</div>

	<!-- Item Details -->
	<div class="grid gap-8 md:grid-cols-2">
		<div>
			<!-- Description -->
			<div class="prose max-w-none mb-6">
				{@html marked(item.d || '')}
			</div>

			<!-- Summary Accordion -->
			<details class="mb-6">
				<summary class="cursor-pointer font-medium mb-2">
					Quick Summary
				</summary>
				<div class="pl-4">
					<p>{item.s || 'No summary available'}</p>
				</div>
			</details>
		</div>

		<div>
			<!-- Action Buttons -->
			<div class="flex flex-col gap-4">
				<ChatWithButton href="/u/{item.u}/c" text="Chat with Owner" />
				<a href="/i/{item.i}/c" class="btn btn-secondary w-full">
					Ask AI About This
				</a>
			</div>
		</div>
	</div>
</div>
