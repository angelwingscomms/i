<script lang="ts">
	import type { Post } from '$lib/types';
	let { data } = $props();
	let post: Post = data.p;
</script>

<svelte:head>
	<title>{post.t}</title>
</svelte:head>

<div class="page pad">
	<div class="mb-lg">
		<a href="/p" class="link">&larr; Back to posts</a>
	</div>
	<article class="card gap">
		<h1 class="title">{post.t}</h1>
		{#if post.p}
			<img src={post.p} alt="Post image" class="w-full rounded mb-md" />
		{/if}
		<div class="text-text leading-relaxed prose">
			{@html post.b}
			<div class="[&>h1]:text-text [&>h1]:my-4 [&>h2]:text-text [&>h2]:my-4 [&>h3]:text-text [&>h3]:my-4 [&>p]:my-2"></div>
		</div>
		<div class="row space-between v-center mt-md">
			<span class="muted">Posted {new Date(post.d).toLocaleDateString()}</span>
			<a href={`/u/${post.u}`} class="link">View author</a>
		</div>
	</article>
</div>
