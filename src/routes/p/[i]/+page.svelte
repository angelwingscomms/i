<script lang="ts">
	import type { Post } from '$lib/types';
	let { data } = $props();
	let post: Post = data.p;
</script>

<svelte:head>
	<title>{post.t}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
	<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
		<a href="/p" class="group inline-flex items-center text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mb-8 font-medium transition-colors duration-200">
			<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Back to posts
		</a>
		<article class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
			{#if post.p}
				<div class="relative overflow-hidden">
					<img src={post.p} alt="Post image" class="w-full h-64 object-cover" />
					<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
				</div>
			{/if}
			<div class="p-8 lg:p-12">
				<h1 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">{post.t}</h1>
				<div class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
					{@html post.b}
				</div>
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-10 pt-8 border-t border-gray-200 dark:border-gray-700 gap-4">
					<span class="text-sm text-gray-500 dark:text-gray-400">Posted on {new Date(post.d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
					<a href={`/u/${post.u}`} class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors duration-200">View author →</a>
				</div>
			</div>
		</article>
	</div>
</div>