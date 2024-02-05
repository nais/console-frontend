import { sveltekit } from '@sveltejs/kit/vite';
import houdini from 'houdini/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig((mode) => {
	const env = loadEnv(mode.mode, process.cwd());

	const headers = (): { [header: string]: string } => {
		const email = env?.VITE_API_USER_EMAIL;

		if (!email) {
			return {};
		}

		console.log('Using email for proxy:', email);
		return {
			'X-User-Email': email
		};
	};

	return {
		plugins: [houdini(), sveltekit()],
		server: {
			proxy: {
				'/query': {
					target: 'http://127.0.0.1:3000',
					headers: headers()
				},
				'/oauth2': {
					target: 'http://127.0.0.1:3000'
				}
			}
		},
		ssr: {
			noExternal: ['@navikt/ds-css']
		}
	};
});
