<script lang="ts">
	import { page } from '$app/stores';

	export let user: any = null;

	$: currentPath = $page.url.pathname;

	function isActive(path: string): boolean {
		if (path === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(path);
	}
</script>

<nav class="navbar">
	<div class="navbar-container">
		<div class="navbar-brand">
			<a href="/" class="brand-link">
				<span class="brand-text">i</span>
			</a>
		</div>

		<div class="navbar-menu">
			{#if user}
				<a
					href="/"
					class="nav-link {isActive('/') ? 'active' : ''}"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
					</svg>
					Search
				</a>

				<a
					href="/edit_user/{user.t}"
					class="nav-link {isActive('/edit_user') ? 'active' : ''}"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
					</svg>
					Profile
				</a>

				<div class="user-info">
					<span class="user-tag">@{user.t}</span>
					<a href="/api/logout" class="logout-btn">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
						</svg>
						Logout
					</a>
				</div>
			{:else}
				<a href="/google" class="login-btn">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path d="M23,11H21V9H19V11H17V13H19V15H21V13H23M8,5V7H12V5M10,2A8,8 0 0,1 18,10A8,8 0 0,1 10,18A8,8 0 0,1 2,10A8,8 0 0,1 10,2M10,4A6,6 0 0,0 4,10A6,6 0 0,0 10,16A6,6 0 0,0 16,10A6,6 0 0,0 10,4Z" />
					</svg>
					Login with Google
				</a>
			{/if}
		</div>

		<!-- Mobile menu button -->
		<div class="mobile-menu-btn">
			<button class="menu-toggle" aria-label="Toggle menu">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
					<path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
				</svg>
			</button>
		</div>
	</div>
</nav>

<style>
	.navbar {
		background: white;
		border-bottom: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.navbar-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
	}

	.navbar-brand {
		display: flex;
		align-items: center;
	}

	.brand-link {
		text-decoration: none;
		display: flex;
		align-items: center;
	}

	.brand-text {
		font-size: 2rem;
		font-weight: 700;
		color: #2563eb;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.navbar-menu {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		text-decoration: none;
		color: #6b7280;
		font-weight: 500;
		border-radius: 8px;
		transition: all 0.2s;
		font-size: 0.95rem;
	}

	.nav-link:hover {
		color: #2563eb;
		background: #f8fafc;
	}

	.nav-link.active {
		color: #2563eb;
		background: #dbeafe;
		font-weight: 600;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-left: 1rem;
		padding-left: 1rem;
		border-left: 1px solid #e2e8f0;
	}

	.user-tag {
		color: #374151;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.logout-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		text-decoration: none;
		color: #dc2626;
		font-weight: 500;
		border-radius: 8px;
		transition: all 0.2s;
		font-size: 0.9rem;
	}

	.logout-btn:hover {
		background: #fef2f2;
		color: #b91c1c;
	}

	.login-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: #2563eb;
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
		transition: all 0.2s;
		font-size: 0.95rem;
	}

	.login-btn:hover {
		background: #1d4ed8;
		transform: translateY(-1px);
	}

	.mobile-menu-btn {
		display: none;
	}

	.menu-toggle {
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 6px;
		transition: all 0.2s;
	}

	.menu-toggle:hover {
		color: #2563eb;
		background: #f8fafc;
	}

	@media (max-width: 768px) {
		.navbar-menu {
			display: none;
		}

		.mobile-menu-btn {
			display: block;
		}

		.navbar-container {
			padding: 0 0.5rem;
		}
	}
</style>
