<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from '$lib/util/toast.svelte.js';
	import axios from 'axios';
	import Button from '$lib/components/Button.svelte';
	import { EventCard } from '$lib/components/event';

	let { data } = $props();

	let event = $state(data.p);
	let user = $state(data.user);
	let author = $state(data.author);
	let joined = $state(data.j === 1);
	let joining = $state(false);
	let users = $state(data.users || []);
	let total_user_count = $state(
		data.total_user_count || 0
	);
	let user_has_description = $state(
		data.user_has_description || false
	);

	async function joinEvent() {
		if (!user) {
			toast.error('You must be logged in to join');
			return;
		}
		joining = true;
		try {
			const res = await axios.post(
				`/~/event/${event.i}/join`
			);
			if (res.data.success) {
				toast.success('Joined event');
				joined = true;
				// Update user ev
				if (!user.ev) user.ev = [];
				user.ev.push(event.i);
			}
		} catch (e) {
			console.error(e);
			toast.error('Failed to join event');
		} finally {
			joining = false;
		}
	}

	function editEvent() {
		goto(`/~/event/${event.i}/edit`);
	}
</script>

<div class="page pad">
	<div class="row space-between v-center mb-md">
		<h1 class="title">
			{event.t || 'Untitled Event'}
		</h1>
		<div class="row">
			{#if user && user.i === event.u}
				<Button text="edit" onclick={editEvent} />
			{/if}
			{#if user && !joined}
				<Button
					text="join event"
					onclick={joinEvent}
					loading={joining}
				/>
			{:else if joined}
				<Button text="joined" disabled />
			{/if}
		</div>
	</div>

	{#if event.p}
		<img
			src={event.p}
			alt={event.t}
			class="event-image"
		/>
	{/if}

	<div class="content">
		{#if event.b}
			<div class="body">{event.b}</div>
		{/if}
	</div>

	{#if author}
		<div class="author">
			by {author.t}
		</div>
	{/if}

	<!-- Users section with total count and conditional content -->
	<div class="users-section">
		<div class="section-header">
			<h2 class="section-title">
				users in this event
			</h2>
			<div class="user-count-badge">
				{total_user_count}
				{total_user_count === 1 ? 'user' : 'users'}
			</div>
			<div class="section-accent"></div>
		</div>

		{#if !user}
			<!-- Logged out state -->
			<div class="prompt-card">
				<div class="prompt-icon">👤</div>
				<div class="prompt-content">
					<h3 class="prompt-title">
						log in to see similar users
					</h3>
					<p class="prompt-text">
						add a description of yourself to see users
						in this event similar to you
					</p>
					<a href="/~/login" class="prompt-button">
						log in
					</a>
				</div>
			</div>
		{:else if !user_has_description}
			<!-- Logged in but no description -->
			<div class="prompt-card">
				<div class="prompt-icon">✏️</div>
				<div class="prompt-content">
					<h3 class="prompt-title">
						add a description to see similar users
					</h3>
					<p class="prompt-text">
						add a description of yourself to your
						profile to see users in this event similar
						to you
					</p>
					<a
						href="/~/user/{user.i}/edit"
						class="prompt-button"
					>
						edit profile
					</a>
				</div>
			</div>
		{:else if users && users.length}
			<!-- Show similar users -->
			<div class="similar-users">
				<div class="similar-users-header">
					<h3 class="similar-users-title">
						users in this zone similar to you
					</h3>
				</div>
				<div class="users-grid">
					{#each users as similarUser (similarUser.i)}
						<a
							href="/~/user/{similarUser.i}"
							class="user-card-link"
						>
							<div class="user-card">
								{#if similarUser.av}
									<img
										src={similarUser.av}
										alt={similarUser.t}
										class="user-avatar"
									/>
								{:else}
									<div
										class="user-avatar placeholder"
									></div>
								{/if}
								<div class="user-info">
									<div class="user-name">
										{similarUser.t}
									</div>
									{#if similarUser.d}
										<div class="user-desc">
											{similarUser.d}
										</div>
									{/if}
									{#if similarUser.similarity !== undefined}
										<div class="similarity-badge">
											{similarUser.similarity}% match
										</div>
									{/if}
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{:else}
			<!-- No similar users found -->
			<div class="prompt-card">
				<div class="prompt-icon">🔍</div>
				<div class="prompt-content">
					<h3 class="prompt-title">
						no similar users found
					</h3>
					<p class="prompt-text">
						no users in this event are similar to you
						based on your profile description
					</p>
				</div>
			</div>
		{/if}
	</div>

	{#if event.children && event.children.length}
		<div class="children">
			<h2>Related Events</h2>
			{#each event.children as child (child.i)}
				<EventCard event={child} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.page {
		max-width: 720px;
		margin: 0 auto;
	}
	.pad {
		padding: 16px;
	}
	.row {
		display: flex;
		gap: 8px;
	}
	.space-between {
		justify-content: space-between;
	}
	.v-center {
		align-items: center;
	}
	.title {
		font-size: 22px;
		font-weight: 700;
	}
	.event-image {
		width: 100%;
		max-height: 400px;
		object-fit: cover;
		border-radius: 12px;
		margin-bottom: 16px;
	}
	.content {
		margin-bottom: 16px;
	}
	.body {
		line-height: 1.6;
	}
	.author {
		font-size: 14px;
		color: var(--muted);
		margin-bottom: 16px;
	}
	.children {
		margin-top: 32px;
	}
	.users-section {
		margin-top: 32px;
	}
	.section-header {
		position: relative;
		margin-bottom: 24px;
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}
	.section-title {
		font-size: 18px;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
		position: relative;
		z-index: 1;
	}
	.user-count-badge {
		background: var(--accent-primary);
		color: white;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
	}
	.section-accent {
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 60px;
		height: 3px;
		background: linear-gradient(
			90deg,
			var(--accent-primary),
			var(--accent-secondary)
		);
		border-radius: 2px;
	}
	.section-header {
		position: relative;
		margin-bottom: 24px;
	}
	.section-title {
		font-size: 18px;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
		position: relative;
		z-index: 1;
		display: inline-block;
	}
	.section-accent {
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 60px;
		height: 3px;
		background: linear-gradient(
			90deg,
			var(--accent-primary),
			var(--accent-secondary)
		);
		border-radius: 2px;
	}
	.users-grid {
		display: grid;
		grid-template-columns: repeat(
			auto-fill,
			minmax(240px, 1fr)
		);
		gap: 16px;
		margin-top: 16px;
	}
	.user-card-link {
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s ease;
	}
	.user-card-link:hover {
		transform: translateY(-2px);
	}
	.user-card {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 16px;
		border-radius: 12px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		transition: all 0.2s ease;
		height: 100%;
	}
	.user-card-link:hover .user-card {
		border-color: var(--accent-primary);
		box-shadow: 0 4px 12px rgba(182, 55, 250, 0.1);
	}
	.user-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}
	.user-avatar.placeholder {
		background: var(--muted);
	}
	.user-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.user-name {
		font-weight: 600;
		font-size: 14px;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.user-desc {
		font-size: 12px;
		color: var(--text-secondary);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.similarity-badge {
		font-size: 11px;
		font-weight: 600;
		color: var(--accent-primary);
		background: rgba(182, 55, 250, 0.1);
		padding: 2px 6px;
		border-radius: 4px;
		align-self: flex-start;
		margin-top: 4px;
	}
</style>
