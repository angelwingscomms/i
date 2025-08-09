import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Local minimal type to avoid implicit any in workbox urlPattern predicate.
 */
type UrlPatternCtx = { request: Request };

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'sw.ts',
			includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
			manifest: {
				name: '144',
				short_name: '144',
				description: 'PWA-ready SvelteKit app',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				background_color: '#fefefe',
				theme_color: '#fefefe',
				icons: [
					{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/icons/icon-256.png', sizes: '256x256', type: 'image/png' },
					{ src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
					{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
					{ src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
					{ src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
				]
			},
			injectManifest: {
				// keep same offline fallback route in SW if needed
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}']
			},
			devOptions: {
				enabled: true,
				type: 'module'
			}
		}),
		devtoolsJson()
	],
	test: {
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					browser: { enabled: true, provider: 'playwright', instances: [{ browser: 'chromium' }] },
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
