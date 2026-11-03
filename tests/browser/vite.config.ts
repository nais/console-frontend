import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	cacheDir: 'node_modules/.vite-browser-tests',
	plugins: [
		svelte({
			configFile: false,
			compilerOptions: { runes: true, experimental: { async: true } }
		})
	]
});
