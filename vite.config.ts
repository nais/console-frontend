import { sveltekit } from '@sveltejs/kit/vite';
import houdini from 'houdini/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [houdini(), sveltekit()],
	server: {
		proxy: {
			'/query': {
				target: 'http://127.0.0.1:3000',
				rewrite: (path) => {
					return path;
				},
				headers: {
					'X-User-Email': import.meta.env?.VITE_API_USER_EMAIL
						? import.meta.env?.VITE_API_USER_EMAIL
						: 'dev.usersen@example.com'
				}
			}
		}
	},
	ssr: {
		noExternal: ['@navikt/ds-css']
	}
});
