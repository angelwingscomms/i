import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command:
			'npm run build && npm run preview -p 4320',
		port: 4320
	},
	testDir: 'e2e'
});
