<script lang="ts">
	import { navigating } from '$app/stores';
	import { onMount } from 'svelte';
	import type { User } from '$lib/types';
	import { themeStore } from '$lib/stores/theme';

	export let user: User | null = null;

	onMount(() => {
		themeStore.init();
	});
</script>

<nav class="nav">
	<div class="container-main">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center">
				<a href="/" class="flex items-center no-underline" aria-label="Home">
					<span class="text-accent font-sans text-4xl font-bold">
						{#if $navigating}
							<svg
								class="h-9 w-9 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						{:else}
							<svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A1,1 0 0,0 14,8H16A1,1 0 0,0 17,7V6A1,1 0 0,1 18,5A1,1 0 0,1 19,6V7A2,2 0 0,1 17,9H15A2,2 0 0,1 13,7V6.27C12.4,5.93 12,5.74 12,5A2,2 0 0,1 12,2M21,9V10A1,1 0 0,1 20,11H19A1,1 0 0,1 18,10V9A1,1 0 0,1 19,8A1,1 0 0,1 20,9M16.5,11C17.3,11 18,11.7 18,12.5V13.5C18,14.3 17.3,15 16.5,15C15.7,15 15,14.3 15,13.5V12.5C15,11.7 15.7,11 16.5,11M10,7A1,1 0 0,1 11,8A1,1 0 0,1 10,9A1,1 0 0,1 9,8A1,1 0 0,1 10,7M6,10.5A1.5,1.5 0 0,1 7.5,12A1.5,1.5 0 0,1 6,13.5A1.5,1.5 0 0,1 4.5,12A1.5,1.5 0 0,1 6,10.5M12,14A1,1 0 0,1 13,15A1,1 0 0,1 12,16A1,1 0 0,1 11,15A1,1 0 0,1 12,14M3.5,19A1.5,1.5 0 0,1 5,20.5A1.5,1.5 0 0,1 3.5,22A1.5,1.5 0 0,1 2,20.5A1.5,1.5 0 0,1 3.5,19Z"
								/>
							</svg>
						{/if}
					</span>
				</a>
			</div>

			<div class="flex items-center gap-4">
				{#if user}
					<a href="/" class="nav-link">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
							/>
						</svg>
						Search
					</a>

					<a href="/edit_user" class="nav-link">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
							/>
						</svg>
						edit profile
					</a>

					<!-- Dark Mode Toggle -->
					<button class="theme-toggle" on:click={themeStore.toggle} aria-label="Toggle dark mode">
						{#if $themeStore === 'dark'}
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17Z"
								/>
							</svg>
						{:else}
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.4 6.35,17.41C9.37,20.43 14,20.54 17.33,17.97Z"
								/>
							</svg>
						{/if}
					</button>

					<div
						class="ml-4 flex items-center gap-4 pl-4"
						style="border-left: 1px solid var(--border-primary)"
					>
						<a href="/user/{user.i}" class="text-primary text-sm font-semibold">{user.t}</a>
						<a href="/api/logout" class="nav-link text-error hover:bg-error/10">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
								/>
							</svg>
							logout
						</a>
					</div>
				{:else}
					<!-- Dark Mode Toggle for non-authenticated users -->
					<button class="theme-toggle" on:click={themeStore.toggle} aria-label="Toggle dark mode">
						{#if $themeStore === 'dark'}
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17Z"
								/>
							</svg>
						{:else}
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.4 6.35,17.41C9.37,20.43 14,20.54 17.33,17.97Z"
								/>
							</svg>
						{/if}
					</button>

					<a href="/google" class="btn-primary btn-md">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M23,11H21V9H19V11H17V13H19V15H21V13H23M8,5V7H12V5M10,2A8,8 0 0,1 18,10A8,8 0 0,1 10,18A8,8 0 0,1 2,10A8,8 0 0,1 10,2M10,4A6,6 0 0,0 4,10A6,6 0 0,0 10,16A6,6 0 0,0 16,10A6,6 0 0,0 10,4Z"
							/>
						</svg>
						login w Google
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>
