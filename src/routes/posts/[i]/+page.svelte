<script lang="ts">
	import { marked } from 'marked';
	import type { Post } from '$lib/types';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Chat from '$lib/components/Chat.svelte';
	import PostSearch from '$lib/components/PostSearch.svelte';
	import { toast } from '$lib/util/toast.svelte.js';
	import axios from 'axios';
	import { untrack } from 'svelte';

	let { data } = $props(),
		post: Post = data.p,
		children = data.children || [];
</script>

<svelte:head>
	<title>{post.t}</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-4 md:p-8">
	<div class="mb-6">
		<Button
			text="explore all posts"
			href="/posts"
			variant="secondary"
			icon="fa-arrow-left"
			class="inline-flex items-center font-medium text-[var(--text-accent)] transition-colors hover:text-[var(--accent-primary)]"
		/>
	</div>

	<div
		class="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-start md:gap-4"
	>
		<div>
			<h1
				class="text-2xl font-bold text-[var(--accent-primary)] md:text-3xl"
			>
				{post.t}
			</h1>
			<div
				class="mt-2 flex flex-wrap items-center gap-2"
			>
				{#if data.author.av}
					<img
						src={data.author.av}
						alt="Author avatar"
						class="h-6 w-6 rounded-full"
					/>
				{/if}
				<span
					class="text-sm text-[var(--text-secondary)]"
				>
					Posted by
				</span>
				<Button
					text={data.author.t}
					href={`/u/${data.author.i}`}
					variant="secondary"
					class="p-0 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
				/>
				<span
					class="text-sm text-[var(--text-secondary)]"
				>
					on {new Date(post.d).toLocaleDateString()}
				</span>
			</div>

			{#if post.f}
				<p
					class="mt-1 text-sm text-[var(--text-secondary)]"
				>
					reply to:
					<a
						class="underline"
						href={`/posts/${post.f}`}
						>{data.pt || post.f}</a
					>
				</p>
			{/if}
		</div>
		<div
			class="flex w-full items-center justify-start gap-2 md:w-auto md:justify-start"
		>
			<Button
				text={data.user?.i === post.u
					? 'Edit'
					: 'View author'}
				href={data.user?.i === post.u
					? `/posts/${post.i}/edit`
					: `/u/${post.u}`}
				icon={data.user?.i === post.u
					? 'fa-edit'
					: undefined}
			/>
			<Button
				text="see child posts"
				href={`/posts/${post.i}/subposts`}
			/>
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
			class="prose prose-invert prose-lg max-w-none"
		>
			{@html marked.parse(post.b || '')}
		</div>
	</article>

	{#if post.c === '.' && children.length > 0}
		<div class="mt-8">
			<h2
				class="mb-4 text-2xl font-bold text-[var(--accent-primary)]"
			>
				child posts
			</h2>
			<PostSearch
				posts={children}
				hide_input={true}
			/>
		</div>
	{/if}

	{#if (data.a && data.messages && data.messages.length > 0) || data.user}
		<div>
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
