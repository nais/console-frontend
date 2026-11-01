import { configDefaults, defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
	envDir: false,
	plugins: [svelte({ configFile: false, compilerOptions: { experimental: { async: true } } })],
	test: {
		globals: true,
		projects: [
			{
				extends: true,
				test: {
					name: 'server',
					exclude: [...configDefaults.exclude, '**/*.client.test.ts']
				}
			},
			{
				extends: true,
				resolve: {
					conditions: ['browser'],
					alias: { $app: path.resolve('./node_modules/@sveltejs/kit/src/runtime/app') }
				},
				test: {
					name: 'client',
					environment: 'jsdom',
					include: ['**/*.client.test.ts']
				}
			}
		]
	},
	resolve: {
		alias: {
			$houdini: path.resolve('./.houdini')
		}
	}
});
