import { dev } from '$app/environment';
import { HoudiniClient } from '$houdini';
import { subscription, type SubscriptionClient } from '$houdini/plugins';
import { handleMissingLogin } from '$lib/authentication';
import { updatesConnectionClosed } from '$lib/stores/update_complete';
import { createClient } from 'graphql-sse';

export default new HoudiniClient({
	plugins: [subscription(sseSockets), handleMissingLogin('UserInfo')]
});

function sseSockets() {
	const client = createClient({
		url: '/graphql',
		onMessage: (data) => {
			if (dev) {
				console.debug('message', data);
			}
		},
		retryAttempts: 1000
	});

	return {
		subscribe(payload, handlers) {
			let vars: Record<string, unknown> | undefined;
			if (payload.variables) {
				vars = payload.variables;
			}

			const unsubscribe = client.subscribe(
				{
					query: payload.query,
					variables: vars,
					operationName: payload.operationName
				},
				{
					next: handlers.next as (value: unknown) => void,
					error: handlers.error,
					complete: () => {
						updatesConnectionClosed.set(new Date());
						handlers.complete();
					}
				}
			);

			return () => {
				unsubscribe();
			};
		}
	} as SubscriptionClient;
}
