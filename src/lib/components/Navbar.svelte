<script lang="ts">
	import { navigating } from '$app/state';
	import type { User } from '$lib/types';
	import { onMount } from 'svelte';
	import { addToast } from '$lib/util/toast.svelte';
	import Button from '$lib/components/Button.svelte';
	import { logout } from '$lib/util/logout.js';

	let {
		user = null,
		onmenu
	}: { user: User | null; onmenu: () => void } =
		$props();

	let can_install = false;
	let deferred_prompt: BeforeInstallPromptEvent | null =
		null;

	let is_installed = false;
	let is_mobile = false;
	let install_listener_attached = false;

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
		is_mobile =
			typeof window !== 'undefined' &&
			(window.matchMedia('(pointer: coarse)')
				.matches ||
				navigator.userAgent
					.toLowerCase()
					.includes('mobile'));
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
			import('$lib/util/toast.svelte').then(
				({ addToast }) =>
					addToast('App installed', 'success')
			);
		} else {
			import('$lib/util/toast.svelte').then(
				({ addToast }) =>
					addToast('Install dismissed', 'info')
			);
		}
		deferred_prompt = null;
		can_install = false;
	}

	function handle_install_click() {
		if (is_installed) {
			addToast('app is already installed', 'info');
			return;
		}
		if (deferred_prompt) {
			do_install();
		} else {
			addToast(
				"install not available yet. use your browser's 'add to home screen' option.",
				'info'
			);
		}
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
		window.addEventListener(
			'request-install-app',
			handle_install_click as any
		);
		install_listener_attached = true;
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
			if (install_listener_attached) {
				window.removeEventListener(
					'request-install-app',
					handle_install_click as any
				);
			}
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
			class="bg-[radial-gradient(circle_at_top_left,var(--accent-light)_0%,transparent_55%)]/70 flex h-20 items-center justify-between rounded-3xl px-6 shadow-[0_0_40px_rgba(207,6,124,0.24)]"
		>
			<div class="flex items-center">
				<a
					href="/~/"
					class="anta text-sm tracking-[0.4em] text-[var(--accent-light)] uppercase no-underline"
					aria-label="home"
				>
					apexlinks
				</a>
			</div>

			<div class="flex items-center gap-3">
				{#if navigating.to}
					<span
						class="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent"
					></span>
				{/if}

				{#if user}
					<a
						href="/{user.t}"
						class="flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-[var(--bg-glass)] px-4 py-2 text-xs font-semibold tracking-wide text-[var(--accent-primary)] uppercase transition-all hover:border-[var(--accent-primary)] hover:text-white hover:shadow-[0_8px_24px_rgba(207,6,124,0.35)]"
					>
						<i class="fas fa-user-circle text-lg"></i>
						{user.t}
					</a>
				{:else}
					<Button
						href="/~/login"
						text="login"
						icon="far fa-user h-4 w-4"
						variant="secondary"
						class="rounded-full border border-[var(--accent-primary)] px-5 py-2 text-xs font-semibold tracking-wide text-[var(--accent-primary)] uppercase transition-all hover:bg-[var(--accent-primary)] hover:text-white"
					/>
				{/if}

				<button
					class="btn-icon flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-primary)] bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-all hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
					onclick={onmenu}
					aria-label="toggle menu"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-6 w-6"
					>
						<path d="M4 7h16M4 12h10M4 17h16" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</nav>
