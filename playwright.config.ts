import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && GOOGLE_API_KEY="${process.env.GOOGLE_API_KEY}" npm run preview',
		port: 4173
	},
	testDir: 'e2e'
});
