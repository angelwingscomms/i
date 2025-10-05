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
						src="/logo.svg"
						alt="Home"
						class="h-[27px] w-auto"
					/>
				</a>
			</div>

			<div class="flex items-center gap-2">
				{#if navigating.to}
					<i class="fas fa-spinner fa-spin text-sm"
					></i>
				{/if}
				<Button
					text="install webapp"
					onclick={handle_install_click}
					variant="primary"
				/>
				<button
					class="btn-icon border-none bg-transparent p-2"
					onclick={onmenu}
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
				{#if user}
					<div class="flex items-center gap-4">
						<Button
							href="/settings"
							text="Settings"
							icon="fa-gear"
							variant="primary"
						/>

						<div
							class="flex items-center gap-3 pl-4"
							style="border-left: 2px solid var(--color-theme-6);"
						>
							<a
								href="/u/{user.i}"
								class="flex items-center gap-2 text-sm font-bold transition-all hover:scale-105"
								style="color: var(--color-theme-1);"
							>
								<i class="fas fa-user-circle"></i>
								{user.t}
							</a>
							<Button
								onclick={logout}
								text="Logout"
								icon="fa-arrow-right-from-bracket"
								variant="secondary"
							/>
						</div>
					</div>
				{:else}
					<Button
						href="/login"
						text="login"
						icon="far fa-user h-4 w-4"
						variant="secondary"
					/>
				{/if}
			</div>
		</div>
	</div>
</nav>
