import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests/browser',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	workers: 2,
	reporter: 'list',
	use: {
		baseURL: 'http://127.0.0.1:4175',
		trace: 'retain-on-failure'
	},
	webServer: {
		command:
			'pnpm exec vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port 4175 --strictPort',
		url: 'http://127.0.0.1:4175/tests/browser/action-menu.html',
		timeout: 60_000
	}
});
