<script lang="ts">
	import { marked } from 'marked';
	import type { Post } from '$lib/types';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Chat from '$lib/components/Chat.svelte';
	import { toast } from '$lib/util/toast.svelte.js';
	import axios from 'axios';
	import { untrack } from 'svelte';

	let { data } = $props(),
		post: Post = data.p;
</script>

<svelte:head>
	<title>{post.t}</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-4 md:p-8">
	<div class="mb-6">
		<a
			href="/posts"
			class="inline-flex items-center font-medium text-[var(--text-accent)] transition-colors hover:text-[var(--accent-primary)]"
			>&larr; Back to posts</a
		>
	</div>

	<div class="mb-8 flex items-start justify-between">
		<div>
			<h1
				class="text-3xl font-bold text-[var(--accent-primary)]"
			>
				{post.t}
			</h1>
			<p class="text-sm text-[var(--text-secondary)]">
				Posted {new Date(post.d).toLocaleDateString()}
			</p>

			{#if post.f}
				<p class="mt-1 text-sm text-[var(--text-secondary)]">
					reply to:
					<a class="underline" href={`/posts/${post.f}`}>{data.pt || post.f}</a>
				</p>
			{/if}

		</div>
		<div class="flex items-center gap-2">
			<Button
				text={data.user?.i === post.u ? 'Edit' : 'View author'}
				href={data.user?.i === post.u ? `/posts/${post.i}/edit` : `/u/${post.u}`}
				icon={data.user?.i === post.u ? 'fa-edit' : undefined}
			/>
			<Button text="see child posts" href={`/posts/${post.i}/subposts`} />
		</div>
	</div>

	<article class="overflow-hidden rounded-lg">
		{#if post.p}
			<img
				src={post.p}
				alt="Post cover"
				class="h-64 w-full object-cover md:h-96"
			/>
		{/if}
		<div
			class="prose prose-invert prose-lg max-w-none px-6 pt-6"
		>
			{@html marked.parse(post.b || '')}
		</div>
	</article>

	{#if (data.a && data.messages && data.messages.length > 0) || data.user}
		<div class="mt-8">
			<Chat
				m={data.messages}
				t="comments"
				_="."
				i={post.i!!}
				authToken={data.a}
				showIcons={false}
			/>
		</div>
	{/if}
</div>
