<script lang="ts">
	import type { User } from '$lib/types';

	let {
		is_open,
		user = null,
		onClose
	}: { is_open: boolean; user: User | null; onClose?: () => void } = $props();

	function close_sidebar() {
		is_open = false;
		onClose?.();
	}
</script>

<aside class="mobile-sidebar" class:is-open={is_open}>
	<div class="sidebar-content">
		<button class="close-button" onclick={close_sidebar} aria-label="Close sidebar">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				width="24"
				height="24"
				role="img"
				aria-hidden="true"
			>
				<path
					d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
				/>
			</svg>
		</button>
		<nav class="sidebar-nav">
			<a href="/" class="sidebar-nav-link" onclick={close_sidebar}>Home</a>
			{#if user}
				<a href="/r" class="sidebar-nav-link" onclick={close_sidebar}>search chatrooms</a>
				<a href="/p" class="sidebar-nav-link" onclick={close_sidebar}>search posts</a>
				<a href="/chats" class="sidebar-nav-link" onclick={close_sidebar}>chats</a>
				<a href="/u" class="sidebar-nav-link" onclick={close_sidebar}>search users</a>
				<a
					href="/tools/youtube-video-summarize-tool"
					class="sidebar-nav-link"
					onclick={close_sidebar}>youtube summarizer</a
				>
				<a href="/settings" class="sidebar-nav-link" onclick={close_sidebar}>settings</a>
				<a href="/edit_user" class="sidebar-nav-link" onclick={close_sidebar}>edit profile</a>
				<a href="/u/{user.i}" class="sidebar-nav-link" onclick={close_sidebar}>{user.t}</a>
				<a href="/logout" class="sidebar-nav-link text-error" onclick={close_sidebar}>logout</a>
			{:else}
				<a
					href="/tools/youtube-video-summarize-tool"
					class="sidebar-nav-link"
					onclick={close_sidebar}>youtube summarizer</a
				>
				<a href="/login" class="sidebar-nav-link" onclick={close_sidebar}>login w username</a>
				<a href="/google" class="sidebar-nav-link" onclick={close_sidebar}>login w Google</a>
			{/if}
		</nav>
	</div>
</aside>

<div
	class="overlay"
	class:is-open={is_open}
	onclick={close_sidebar}
	role="button"
	tabindex="0"
	onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && close_sidebar()}
	aria-label="Close sidebar overlay"
></div>

<style>
	.mobile-sidebar {
		position: fixed;
		top: 0;
		right: -300px; /* Hidden by default */
		width: 300px;
		height: 100%;
		background-color: var(--bg-primary);
		box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
		transition: right 0.3s ease-in-out;
		z-index: 1000;
	}

	.mobile-sidebar.is-open {
		right: 0;
	}

	.sidebar-content {
		padding: 20px;
	}

	.close-button {
		background: none;
		border: none;
		color: var(--text-primary);
		cursor: pointer;
		position: absolute;
		top: 15px;
		right: 15px;
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: 15px;
		margin-top: 50px; /* Space for close button */
	}

	.sidebar-nav-link {
		color: var(--text-primary);
		text-decoration: none;
		font-size: 1.1em;
		padding: 10px 0;
		border-bottom: 1px solid var(--border-primary);
	}

	.sidebar-nav-link:hover {
		color: var(--accent-color);
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
		opacity: 0;
		visibility: hidden;
		transition:
			opacity 0.3s ease-in-out,
			visibility 0.3s ease-in-out;
	}

	.overlay.is-open {
		opacity: 1;
		visibility: visible;
	}

	/* Sidebar is now available on all screen sizes */
</style>
