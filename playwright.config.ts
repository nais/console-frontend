import { defineConfig } from '@playwright/test';

const consoleUrl = process.env.CONSOLE_E2E_URL;

export default defineConfig({
	testDir: './tests/browser',
	testMatch: consoleUrl ? '**/home-network.spec.ts' : undefined,
	testIgnore: consoleUrl ? undefined : '**/home-network.spec.ts',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	workers: 2,
	reporter: 'list',
	use: {
		baseURL: consoleUrl ?? 'http://127.0.0.1:4175',
		trace: 'retain-on-failure'
	},
	webServer: consoleUrl
		? undefined
		: {
				command:
					'pnpm exec vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port 4175 --strictPort',
				url: 'http://127.0.0.1:4175/tests/browser/action-menu.html',
				timeout: 60_000
			}
});
