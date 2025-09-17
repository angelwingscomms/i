<script lang="ts">
	import { navigating } from '$app/state';
	import type { User } from '$lib/types';
	import {
		onMount,
		createEventDispatcher
	} from 'svelte';
	import { fade } from 'svelte/transition';
	import { toasts, addToast } from '$lib/util/toast';

	let { user = null }: { user: User | null } =
		$props();

	let can_install = false;
	let deferred_prompt: BeforeInstallPromptEvent | null =
		null;

	// Navigation timeout to prevent endless spinning
	// let navigation_start_time = $state<number | null>(null);

	// $effect(() => {
	// 	if (navigating) {
	// 		navigation_start_time = Date.now();
	// 		// Set a timeout to reset navigation state if it takes too long
	// 		const timeout = setTimeout(() => {
	// 			if (navigation_start_time && Date.now() - navigation_start_time > 10000) {
	// 				console.warn('Navigation timeout - forcing reset');
	// 				// This is a workaround - in a real scenario, we'd need to handle this differently
	// 				window.location.reload();
	// 			}
	// 		}, 10000);

	// 		return () => clearTimeout(timeout);
	// 	} else {
	// 		navigation_start_time = null;
	// 	}
	// });
	let is_installed = false;

	const dispatch = createEventDispatcher();

	function toggle_menu() {
		dispatch('menutoggle');
	}

	type BeforeInstallPromptEvent = Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{
			outcome: 'accepted' | 'dismissed';
			platform: string;
		}>;
	};

	function update_is_installed() {
		// iOS standalone support via navigator.standalone; others via display-mode
		// @ts-ignore
		const iosStandalone =
			typeof window !== 'undefined' &&
			(navigator as any).standalone === true;
		const mql =
			typeof window !== 'undefined'
				? window.matchMedia(
						'(display-mode: standalone)'
					)
				: null;
		is_installed = iosStandalone || !!mql?.matches;
	}

	function on_beforeinstallprompt(e: Event) {
		e.preventDefault();
		deferred_prompt = e as BeforeInstallPromptEvent;
		can_install = !is_installed && !!deferred_prompt;
	}

	async function do_install() {
		if (!deferred_prompt) return;
		await deferred_prompt.prompt();
		const choice = await deferred_prompt.userChoice;
		if (choice.outcome === 'accepted') {
			import('$lib/util/toast').then(({ addToast }) =>
				addToast('App installed', 'success')
			);
		} else {
			import('$lib/util/toast').then(({ addToast }) =>
				addToast('Install dismissed', 'info')
			);
		}
		deferred_prompt = null;
		can_install = false;
	}

	function on_appinstalled() {
		addToast('App installed', 'success');
		update_is_installed();
		can_install = false;
		deferred_prompt = null;
	}

	onMount(() => {
		update_is_installed();
		window.addEventListener(
			'beforeinstallprompt',
			on_beforeinstallprompt
		);
		window.addEventListener(
			'appinstalled',
			on_appinstalled
		);
		const mql = window.matchMedia(
			'(display-mode: standalone)'
		);
		const mql_handler = () => {
			update_is_installed();
			if (is_installed) can_install = false;
		};
		mql.addEventListener?.('change', mql_handler);
		return () => {
			window.removeEventListener(
				'beforeinstallprompt',
				on_beforeinstallprompt
			);
			window.removeEventListener(
				'appinstalled',
				on_appinstalled
			);
			mql.removeEventListener?.(
				'change',
				mql_handler
			);
		};
	});
</script>

<nav class="nav">
	<div class="container-main">
		<div
			class="flex h-16 items-center justify-between"
		>
			<div class="flex items-center">
				<a
					href="/"
					class="flex items-center no-underline"
					aria-label="Home"
				>
					<img
						src="/favicon.svg"
						alt="Home"
						class="h-8 w-8"
					/>
				</a>
			</div>

			<div>
				<button
					class="btn-icon"
					onclick={toggle_menu}
					aria-label="Toggle menu"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						width="24"
						height="24"
					>
						<path
							d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
						/>
					</svg>
				</button>
			</div>

			<div class="hidden items-center gap-6 md:flex">
				{#if can_install && !is_installed}
					<button
						class="rounded-full px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
						style="background: var(--color-theme-1);"
						onclick={do_install}
						transition:fade
					>
						Install App
					</button>
				{/if}

				<!-- Feature Navigation Links -->
				<div class="flex items-center gap-4">
					<a
						href="/i"
						class="nav-link group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all hover:scale-105"
						style="color: var(--color-theme-1); border: 1px solid var(--color-theme-1);"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M19,7H18V6A2,2 0 0,0 16,4H8A2,2 0 0,0 6,6V7H5A1,1 0 0,0 4,8V19A3,3 0 0,0 7,22H17A3,3 0 0,0 20,19V8A1,1 0 0,0 19,7M8,6H16V7H8V6M18,19A1,1 0 0,1 17,20H7A1,1 0 0,1 6,19V9H18V19Z"
							/>
						</svg>
						Items
					</a>
					<a
						href="/u"
						class="nav-link group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all hover:scale-105"
						style="color: var(--color-theme-2); border: 1px solid var(--color-theme-2);"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
							/>
						</svg>
						Users
					</a>
					<a
						href="/r"
						class="nav-link group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all hover:scale-105"
						style="color: var(--color-theme-3); border: 1px solid var(--color-theme-3);"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25Z"
							/>
						</svg>
						Rooms
					</a>
				</div>

				{#if user}
					<div class="flex items-center gap-4">
						<a
							href="/settings"
							class="nav-link group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all hover:scale-105"
							style="color: var(--color-theme-1); border: 1px solid var(--color-theme-1);"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M12,8A4,4 0 1,0 16,12A4,4 0 0,0 12,8M4.93,6.14L3.5,4.71L2.09,6.12L3.5,7.53L4.93,6.14M19.07,6.14L20.5,7.53L21.91,6.12L20.5,4.71L19.07,6.14M12,2H12A1,1 0 0,1 13,3V5A1,1 0 0,1 12,6A1,1 0 0,1 11,5V3A1,1 0 0,1 12,2M12,18A1,1 0 0,1 13,19V21A1,1 0 0,1 12,22A1,1 0 0,1 11,21V19A1,1 0 0,1 12,18M2,12A1,1 0 0,1 3,11H5A1,1 0 0,1 6,12A1,1 0 0,1 5,13H3A1,1 0 0,1 2,12M18,12A1,1 0 0,1 19,11H21A1,1 0 0,1 22,12A1,1 0 0,1 21,13H19A1,1 0 0,1 18,12Z"
								/>
							</svg>
							Settings
						</a>
						<a
							href="/edit_user"
							class="nav-link group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all hover:scale-105"
							style="color: var(--color-theme-6); border: 1px solid var(--color-theme-6);"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
								/>
							</svg>
							Edit Profile
						</a>

						<div
							class="flex items-center gap-3 pl-4"
							style="border-left: 2px solid var(--color-theme-6);"
						>
							<a
								href="/u/{user.i}"
								class="text-sm font-bold transition-all hover:scale-105"
								style="color: var(--color-theme-1);"
								>{user.t}</a
							>
							<a
								href="/logout"
								class="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all hover:scale-105"
								style="color: var(--color-theme-5); border: 1px solid var(--color-theme-5);"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path
										d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
									/>
								</svg>
								Logout
							</a>
						</div>
					</div>
				{:else}
					<a
						href="/login"
						class="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all hover:scale-105"
						style="color: var(--color-theme-1); border: 1px solid var(--color-theme-1);"
					>
						Login w/ Username
					</a>
					<a
						href="/google"
						class="group flex items-center gap-3 rounded-full px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
						style="background: var(--color-theme-2);"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M21.35,11.1H12.18V14.89H17.48C17.18,16.89 15.19,18.15 12.18,18.15C9.57,18.15 7.39,15.93 7.39,13.11C7.39,10.29 9.57,8.07 12.18,8.07C13.68,8.07 14.65,8.62 15.32,9.27L18.04,6.64C16.4,5.08 14.07,4 12.18,4C7.4,4 3.53,7.87 3.53,13.11C3.53,18.35 7.4,22.22 12.18,22.22C16.8,22.22 20.25,18.06 20.25,13.11C20.25,12.44 20.19,11.75 20.08,11.1H21.35V11.1Z"
							/>
						</svg>
						Sign In with Google
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>
