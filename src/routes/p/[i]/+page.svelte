<script lang="ts">
	import type { Post } from '$lib/types';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';

	let { data } = $props();
	let post: Post = data.p;
</script>

<svelte:head>
	<title>{post.t}</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-4 md:p-8">
	<div class="mb-6">
		<a
			href="/p"
			class="inline-flex items-center font-medium text-[var(--text-accent)] transition-colors hover:text-[var(--accent-primary)]"
			>&larr; Back to posts</a
		>
	</div>
	<article
		class="overflow-hidden rounded-lg bg-[var(--bg-card)]"
	>
		{#if post.p}
			<img
				src={post.p}
				alt="Post image"
				class="h-64 w-full object-cover md:h-96"
			/>
		{/if}
		<h1
			class="mb-4 px-6 pt-6 text-3xl font-bold text-[var(--text-primary)] md:text-4xl"
		>
			{post.t}
		</h1>
		<div class="prose prose-lg mb-8 max-w-none px-6">
			{@html post.b}
		</div>
		<div
			class="flex items-center justify-between px-6 pb-6 text-sm text-[var(--text-secondary)]"
		>
			<span
				>Posted {new Date(
					post.d
				).toLocaleDateString()}</span
			>
			<div class="flex items-center gap-4">
				<Button
					text={data.user?.i === post.u
						? 'Edit'
						: 'View author'}
					href={data.user?.i === post.u
						? `/p/${post.i}/edit`
						: `/u/${post.u}`}
					class="font-medium text-[var(--text-accent)] transition-colors hover:text-[var(--accent-primary)]"
				/>
			</div>
		</div>
	</article>
</div>
