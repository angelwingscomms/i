import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function createThemeStore() {
	const { subscribe, set, update } =
		writable<Theme>('light');

	return {
		subscribe,
		init: () => {
			if (!browser) return;
			set('light');
			applyTheme('light');
		},
		toggle: () => {
			update((current) => {
				const next =
					current === 'dark' ? 'light' : 'dark';
				applyTheme(next);
				return next;
			});
		}
	};
}

function applyTheme(theme: Theme) {
	if (!browser) return;

	if (theme === 'dark') {
		document.documentElement.setAttribute(
			'data-theme',
			'dark'
		);
	} else {
		document.documentElement.removeAttribute(
			'data-theme'
		);
	}
}

export const themeStore = createThemeStore();
