import { configDefaults, defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
	plugins: [svelte({ configFile: false, compilerOptions: { experimental: { async: true } } })],
	test: {
		globals: true,
		exclude: [...configDefaults.exclude, 'tests/browser/**']
	},
	resolve: {
		alias: {
			$houdini: path.resolve('./.houdini')
		}
	}
});
