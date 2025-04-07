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

	const targetProxy = env.VITE_PROXY_ENDPOINT ?? 'http://127.0.0.1:3000';

	return {
		plugins: [houdini(), sveltekit()],
		server: {
			proxy: {
				'/graphql': {
					target: targetProxy,
					headers: headers(),
					changeOrigin: targetProxy.indexOf('127.0.0.1') < 0
				},
				'/oauth2': {
					target: targetProxy,
					changeOrigin: targetProxy.indexOf('127.0.0.1') < 0
				}
			}
		}
	};
});
