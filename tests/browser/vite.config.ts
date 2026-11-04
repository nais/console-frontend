import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	cacheDir: 'node_modules/.vite-browser-tests',
	resolve: {
		alias: {
			'$app/env': fileURLToPath(new URL('./browser-env.ts', import.meta.url)),
			'$app/state': fileURLToPath(new URL('./browser-navigation.ts', import.meta.url)),
			'$app/navigation': fileURLToPath(new URL('./browser-navigation.ts', import.meta.url))
		}
	},
	plugins: [
		svelte({
			configFile: false,
			compilerOptions: { runes: true, experimental: { async: true } }
		})
	]
});
