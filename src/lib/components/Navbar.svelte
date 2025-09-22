<script lang="ts">
	import { navigating } from '$app/state';
	import type { User } from '$lib/types';
	import {
		onMount,
		createEventDispatcher
	} from 'svelte';
	import { addToast } from '$lib/util/toast.svelte';
		import Button from '$lib/components/Button.svelte';


	let { user = null }: { user: User | null } =
		$props();

	let can_install = false;
	let deferred_prompt: BeforeInstallPromptEvent | null =
		null;

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
			import('$lib/util/toast.svelte').then(({ addToast }) =>
				addToast('App installed', 'success')
			);
		} else {
			import('$lib/util/toast.svelte').then(({ addToast }) =>
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
						src="/white-logo.svg"
						alt="Home"
						class="h-8 w-auto"
					/>
				</a>
			</div>

			<div class="flex items-center gap-2">
				{#if navigating.to}
					<i class="fas fa-spinner fa-spin text-sm"></i>
				{/if}
				<Button text="install webapp" onclick={handle_install_click} variant="primary" />
				<button
					class="btn-icon border-none bg-transparent p-2"
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

				{#if user}
					<div class="flex items-center gap-4">
						<a
							href="/settings"
							class="nav-link group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all hover:scale-105"
							style="color: var(--color-theme-1); border: 1px solid var(--color-theme-1);"
						>
							<i
								class="fa-solid fa-gear mr-2 text-[1.1em] text-current"
							></i>
							Settings
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
								<i
									class="fa-solid fa-arrow-right-from-bracket mr-2 text-[1.1em] text-current"
								></i>
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
						<i class="far fa-user h-4 w-4"></i>Login
						w/ Username
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
