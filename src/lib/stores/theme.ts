import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>('light');

	return {
		subscribe,
		init: () => {
			if (!browser) return;

			// Check for saved theme preference
			const savedTheme = localStorage.getItem('theme') as Theme | null;
			if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
				set(savedTheme);
				applyTheme(savedTheme);
				return;
			}

			// Check system preference
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const systemTheme: Theme = prefersDark ? 'dark' : 'light';
			set(systemTheme);
			applyTheme(systemTheme);
		},
		toggle: () => {
			update((currentTheme) => {
				const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
				if (browser) {
					localStorage.setItem('theme', newTheme);
					applyTheme(newTheme);
				}
				return newTheme;
			});
		},
		setTheme: (theme: Theme) => {
			set(theme);
			if (browser) {
				localStorage.setItem('theme', theme);
				applyTheme(theme);
			}
		}
	};
}

function applyTheme(theme: Theme) {
	if (!browser) return;

	if (theme === 'dark') {
		document.documentElement.setAttribute('data-theme', 'dark');
	} else {
		document.documentElement.removeAttribute('data-theme');
	}
}

export const themeStore = createThemeStore();
