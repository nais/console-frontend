import { sveltekit } from '@sveltejs/kit/vite';
import houdini from 'houdini/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [houdini(), sveltekit()],
	server: {
		proxy: {
			'/query': {
				target: 'http://127.0.0.1:6969',
				rewrite: (path) => {
					return path;
				}
			}
		}
	}
});
