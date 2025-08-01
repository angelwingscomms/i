import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function createThemeStore() {
	const { subscribe, set } = writable<Theme>('dark'); // Default to dark

	return {
		subscribe,
		init: () => {
			if (!browser) return;

			// Always set to dark theme
			set('dark');
			applyTheme('dark');
		}
	};
}

function applyTheme(theme: Theme) {
	if (!browser) return;

	if (theme === 'dark') {
		document.documentElement.setAttribute('data-theme', 'dark');
	} else {
		// Even if the initial theme is dark, ensure no data-theme is set for 'light'
		// This branch will effectively not be hit if we always default to 'dark'
		document.documentElement.removeAttribute('data-theme');
	}
}

export const themeStore = createThemeStore();
