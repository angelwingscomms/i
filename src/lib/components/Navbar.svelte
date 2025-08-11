<script lang="ts">
	import { navigating } from '$app/stores';
	import type { User } from '$lib/types';
	import { onMount, createEventDispatcher } from 'svelte';
	import { toasts } from '$lib/util/toast';

	export let user: User | null = null;

	let can_install = false;
	let deferred_prompt: BeforeInstallPromptEvent | null = null;
	let is_installed = false;

	const dispatch = createEventDispatcher();

	function toggle_menu() {
		dispatch('menutoggle');
	}

	type BeforeInstallPromptEvent = Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
	};

	function update_is_installed() {
		// iOS standalone support via navigator.standalone; others via display-mode
		// @ts-ignore
		const iosStandalone = typeof window !== 'undefined' && (navigator as any).standalone === true;
		const mql =
			typeof window !== 'undefined' ? window.matchMedia('(display-mode: standalone)') : null;
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
			import('$lib/util/toast').then(({ addToast }) => addToast('App installed', 'success'));
		} else {
			import('$lib/util/toast').then(({ addToast }) => addToast('Install dismissed', 'info'));
		}
		deferred_prompt = null;
		can_install = false;
	}

	function on_appinstalled() {
		toasts.add({ type: 'success', message: 'App installed' });
		update_is_installed();
		can_install = false;
		deferred_prompt = null;
	}

	onMount(() => {
		update_is_installed();
		window.addEventListener('beforeinstallprompt', on_beforeinstallprompt);
		window.addEventListener('appinstalled', on_appinstalled);
		const mql = window.matchMedia('(display-mode: standalone)');
		const mql_handler = () => {
			update_is_installed();
			if (is_installed) can_install = false;
		};
		mql.addEventListener?.('change', mql_handler);
		return () => {
			window.removeEventListener('beforeinstallprompt', on_beforeinstallprompt);
			window.removeEventListener('appinstalled', on_appinstalled);
			mql.removeEventListener?.('change', mql_handler);
		};
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
							<span class="wdxl">144</span>
						{/if}
					</span>
				</a>
			</div>

			<div class="md:hidden">
				<button class="btn-icon" onclick={toggle_menu} aria-label="Toggle menu">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						width="24"
						height="24"
					>
						<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
					</svg>
				</button>
			</div>

			<div class="hidden items-center gap-4 md:flex">
				{#if can_install && !is_installed}
					<button class="btn-primary btn-sm" onclick={do_install} transition:fade>
						install
					</button>
				{/if}

				{#if user}
					<a href="/edit_user" class="nav-link">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
							/>
						</svg>
						edit profile
					</a>

					<div
						class="ml-4 flex items-center gap-4 pl-4"
						style="border-left: 1px solid var(--border-primary)"
					>
						<a href="/u/{user.i}" class="text-primary text-sm font-semibold">{user.t}</a>
						<a href="/logout" class="nav-link text-error hover:bg-error/10">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
								/>
							</svg>
							logout
						</a>
					</div>
				{:else}
					<a href="/google" class="btn-primary btn-md">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M21.35,11.1H12.18V14.89H17.48C17.18,16.89 15.19,18.15 12.18,18.15C9.57,18.15 7.39,15.93 7.39,13.11C7.39,10.29 9.57,8.07 12.18,8.07C13.68,8.07 14.65,8.62 15.32,9.27L18.04,6.64C16.4,5.08 14.07,4 12.18,4C7.4,4 3.53,7.87 3.53,13.11C3.53,18.35 7.4,22.22 12.18,22.22C16.8,22.22 20.25,18.06 20.25,13.11C20.25,12.44 20.19,11.75 20.08,11.1H21.35V11.1Z"
							/>
						</svg>
						login w Google
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>
