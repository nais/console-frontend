import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { optimizeImports } from '@nais/ds-svelte-community-preprocess-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess(), optimizeImports()],

	kit: {
		adapter: adapter(),
		alias: {
			$houdini: './$houdini'
		}
	}
};

export default config;
