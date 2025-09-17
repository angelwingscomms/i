<script lang="ts">
	import axios from 'axios';
	import ChatBox from '$lib/components/ChatBox.svelte';
	import type { ChatMessage } from '$lib/types';

	type Result = {
		id: string;
		title: string;
		description: string;
		publishedAt: string;
		thumbnail: string;
		viewCount: number;
		url: string;
	};

	let query = $state('');
	let results = $state<Result[]>([]);
	let loading = $state(false);
	let errorMsg = $state('');

	// Chat modal state
	let showChat = $state(false);
	let chatTitle = $state('');
	let chatDescription = $state('');
	let chatTranscript = $state('');
	let messages = $state<ChatMessage[]>([]);

	async function search() {
		loading = true;
		errorMsg = '';
		try {
			const res = await axios.post('/api/youtube/search', { q: query, maxResults: 12 });
			results = res.data as Result[];
		} catch (e) {
			console.error(e);
			errorMsg = 'Search failed';
		} finally {
			loading = false;
		}
	}

	async function summarize(r: Result) {
		showChat = true;
		chatTitle = r.title;
		chatDescription = r.description;
		chatTranscript = '';
		messages = [];

		// Load transcript then summary
		try {
			const t = await axios.post('/api/youtube/transcript', { id: r.id });
			chatTranscript = t.data?.t || '';
		} catch {
			chatTranscript = '';
		}

		try {
			const s = await axios.post('/api/youtube/summarize', {
				title: chatTitle,
				description: chatDescription,
				transcript: chatTranscript
			});
			const sum = String(s.data?.s || '');
			const id = crypto.randomUUID();
			messages = [...messages, { i: id, m: sum, saved: true }];
		} catch (e) {
			const id = crypto.randomUUID();
			messages = [...messages, { i: id, m: 'Failed to summarize', saved: true }];
		}
	}

	async function onsend(text: string) {
		const id = crypto.randomUUID();
		messages = [...messages, { i: id, m: text }];
		try {
			const convo = messages.map((m) => ({ role: m.saved ? 'model' : 'user', text: m.m }));
			const res = await axios.post('/api/youtube/chat', {
				title: chatTitle,
				description: chatDescription,
				transcript: chatTranscript,
				messages: convo
			});
			const reply = String(res.data?.t || '');
			messages = [...messages, { i: crypto.randomUUID(), m: reply, saved: true }];
		} catch (e) {
			messages = [...messages, { i: crypto.randomUUID(), m: 'Failed to chat', saved: true }];
		}
	}
</script>

<div class="container">
	<h1 class="title">YouTube Video Summarizer</h1>
	<div class="search-bar">
		<label class="sr-only" for="ytq">Search query</label>
		<input
			id="ytq"
			class="input"
			placeholder="search videos..."
			bind:value={query}
			onkeydown={(e) => e.key === 'Enter' && search()}
		/>
		<button class="btn" onclick={search} aria-label="Search">search</button>
	</div>

	{#if errorMsg}
		<p class="error" role="alert">{errorMsg}</p>
	{/if}

	{#if loading}
		<p>loading...</p>
	{:else}
		<div class="grid">
			{#each results as r}
				<div class="card">
					<img alt={r.title} src={r.thumbnail} class="thumb" />
					<div class="meta">
						<a href={r.url} target="_blank" rel="noopener" class="video-title">{r.title}</a>
						<p class="desc">{r.description}</p>
						<div class="stats">
							<span aria-label="views">{r.viewCount.toLocaleString()} views</span>
							<span aria-label="published">{new Date(r.publishedAt).toLocaleDateString()}</span>
						</div>
						<button class="btn-secondary" onclick={() => summarize(r)}>summarize</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if showChat}
		<div
			class="modal_backdrop"
			role="button"
			tabindex="0"
			aria-label="Close chat"
			onclick={() => (showChat = false)}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (showChat = false)}
		></div>
		<div class="modal" role="dialog" aria-modal="true" aria-label="Chat about video">
			<header class="modal_header">
				<h2 class="modal_title">{chatTitle}</h2>
				<button class="close" onclick={() => (showChat = false)} aria-label="Close">×</button>
			</header>
			<section class="modal_body">
				<ChatBox {messages} {onsend} />
			</section>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 1080px;
		margin: 0 auto;
		padding: 16px;
	}
	.title {
		font-size: 1.5rem;
		margin-bottom: 12px;
	}
	.search-bar {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.input {
		flex: 1;
		padding: 10px;
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
	}
	.btn {
		padding: 10px 14px;
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
		background: var(--bg-card);
	}
	.btn-secondary {
		padding: 8px 12px;
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
		background: transparent;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 12px;
		margin-top: 16px;
	}
	.card {
		border: 1px solid var(--border-secondary);
		border-radius: 10px;
		overflow: hidden;
		background: var(--bg-card);
		display: flex;
		flex-direction: column;
	}
	.thumb {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}
	.meta {
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.video-title {
		font-weight: 600;
		text-decoration: none;
		color: var(--text-primary);
	}
	.desc {
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.2rem;
		max-height: 4.8rem;
		overflow: hidden;
	}
	.stats {
		display: flex;
		gap: 12px;
		font-size: 0.8rem;
		color: var(--text-secondary);
	}
	.error {
		color: #b00;
		margin-top: 8px;
	}

	.modal_backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
	}
	.modal {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(720px, 92vw);
		max-height: 92vh;
		background: var(--bg-primary);
		border: 1px solid var(--border-secondary);
		border-radius: 12px;
		display: flex;
		flex-direction: column;
	}
	.modal_header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 12px;
		border-bottom: 1px solid var(--border-secondary);
	}
	.modal_title {
		font-size: 1rem;
		font-weight: 600;
	}
	.modal_body {
		padding: 8px;
	}
	.close {
		background: transparent;
		border: none;
		font-size: 24px;
		line-height: 1;
		cursor: pointer;
	}
</style>
