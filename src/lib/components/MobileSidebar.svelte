<script lang="ts">
import { page } from '$app/state';
import type { User } from '$lib/types';
import { logout } from '$lib/util/logout';
import { addToast } from '$lib/util/toast.svelte';
	let {
		is_open,
		onClose
	}: {
		is_open: boolean;
		onClose?: () => void;
	} = $props();

	function close_sidebar() {
		is_open = false;
		onClose?.();
	}

function handle_install() {
	if (window.matchMedia('(display-mode: standalone)').matches) {
		addToast('app is already installed', 'info');
		return;
	}
	window.dispatchEvent(new CustomEvent('request-install-app'));
}
</script>

<aside class="mobile-sidebar" class:is-open={is_open}>
	<div class="sidebar-content">
		<button
			class="close-button"
			onclick={close_sidebar}
			aria-label="Close sidebar"
		>
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
	<nav class="sidebar-nav flex-1 overflow-y-auto pb-5 pr-2">
			<a
				href="/~/"
				class="sidebar-nav-link"
				style="color: var(--color-theme-1);"
				onclick={close_sidebar}
			>
				<i
					class="far fa-house"
					style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
				></i>
				Home
			</a>
			{#if page.data.user}
			<a
				onclick={() => {
					handle_install();
					close_sidebar();
				}}
				class="sidebar-nav-link"
				style="color: var(--color-theme-2); cursor: pointer;"
			>
				<i
					class="fa-solid fa-download"
					style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
				></i>
				install app
			</a>
				<a
					href="/~/items"
					class="sidebar-nav-link"
					style="color: var(--color-theme-5);"
					onclick={close_sidebar}
				>
					<i
						class="fa-solid fa-bag-shopping"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					items
				</a>
				<a
					href="/~/r"
					class="sidebar-nav-link"
					style="color: var(--color-theme-3);"
					onclick={close_sidebar}
				>
					<i
						class="far fa-comments"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					chatrooms
				</a>
				<a
					href="/~/posts"
					class="sidebar-nav-link"
					style="color: var(--color-theme-2);"
					onclick={close_sidebar}
				>
					<i
						class="fa-solid fa-pen"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					posts
				</a>
				<a
					href="/~/chats"
					class="sidebar-nav-link"
					style="color: var(--color-theme-4);"
					onclick={close_sidebar}
				>
					<i
						class="far fa-comment-dots"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					chats
				</a>
				<a
					href="/~/u"
					class="sidebar-nav-link"
					style="color: var(--color-theme-6);"
					onclick={close_sidebar}
				>
					<i
						class="fa-solid fa-users"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					users
				</a>
				<a
					href="/~/zones"
					class="sidebar-nav-link"
					style="color: var(--color-theme-1);"
					onclick={close_sidebar}
				>
					<i
						class="fa-solid fa-globe"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					zones
				</a>
				<a
					href="/~/tools/youtube-video-summarize-tool"
					class="sidebar-nav-link"
					style="color: var(--color-theme-1);"
					onclick={close_sidebar}
				>
					<i
						class="far fa-circle-play"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					youtube summarizer
				</a>
				<a
					href="/~/settings"
					class="sidebar-nav-link"
					style="color: var(--color-theme-4);"
					onclick={close_sidebar}
				>
					<i
						class="fa-solid fa-gear"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					settings
				</a>
				<a
					href="/~/resume"
					class="sidebar-nav-link"
					style="color: var(--color-theme-2);"
					onclick={close_sidebar}
				>
					<i
						class="far fa-file-lines"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					resume
				</a>
				<a
					href="/~/{page.data.user.t}"
					class="sidebar-nav-link"
					style="color: var(--color-theme-4);"
					onclick={close_sidebar}
				>
					<i
						class="far fa-user"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					{page.data.user.t}
				</a>
				<a
					class="sidebar-nav-link text-error"
					style="color: var(--color-theme-5);"
					onclick={async () => {
						close_sidebar();
						await logout();
					}}
				>
					<i
						class="fa-solid fa-arrow-right-from-bracket"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					logout
				</a>
			{:else}
				<a
					href="/~/tools/youtube-video-summarize-tool"
					class="sidebar-nav-link"
					style="color: var(--color-theme-1);"
					onclick={close_sidebar}
				>
					<i
						class="far fa-circle-play"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					youtube summarizer
				</a>
				<a
					href="/~/i"
					class="sidebar-nav-link"
					style="color: var(--color-theme-5);"
					onclick={close_sidebar}
				>
					<i
						class="fa-solid fa-bag-shopping"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					items
				</a>
				<a
					href="/~/zones"
					class="sidebar-nav-link"
					style="color: var(--color-theme-1);"
					onclick={close_sidebar}
				>
					<i
						class="fa-solid fa-globe"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					zones
				</a>
				<a
					href="/~/login"
					class="sidebar-nav-link"
					style="color: var(--color-theme-1);"
					onclick={close_sidebar}
				>
					<i
						class="fas fa-right-to-bracket"
						style="margin-right: 0.5rem; color: inherit; font-size: 1.1em;"
					></i>
					login
				</a>
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
	onkeydown={(e) =>
		(e.key === 'Enter' || e.key === ' ') &&
		close_sidebar()}
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
		display: flex;
		flex-direction: column;
	}

	.mobile-sidebar.is-open {
		right: 0;
	}

	.sidebar-content {
		height: 100%;
		padding: 20px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
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
		scrollbar-gutter: stable both-edges;
	}

	.sidebar-nav-link {
		color: var(--text-primary);
		text-decoration: none;
		font-size: 1.1em;
		padding: 10px 0;
		border-bottom: 1px solid var(--border-primary);
		display: flex;
		align-items: center;
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
