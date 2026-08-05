import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
	plugins: [svelte()],
	test: {
		globals: true
		// environment: 'jsdom',
	},
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib'),
			$houdini: path.resolve('./.houdini'),
			'$app/forms': path.resolve('./src/lib/test/app-forms.ts')
		}
	}
});
