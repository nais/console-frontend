import { sveltekit } from '@sveltejs/kit/vite';
import houdini from 'houdini/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig((mode) => {
	const env = loadEnv(mode.mode, process.cwd());

	return {
		plugins: [houdini(), sveltekit()],
		server: {
			proxy: {
				'/query': {
					target: 'http://127.0.0.1:3000',
					rewrite: (path) => {
						return path;
					},
					headers: {
						'X-User-Email': env?.VITE_API_USER_EMAIL
							? env?.VITE_API_USER_EMAIL
							: 'admin.usersen@example.com'
					}
				}
			}
		},
		ssr: {
			noExternal: ['@navikt/ds-css']
		}
	};
});
