import { browser, dev } from '$app/environment';
import { HoudiniClient } from '$houdini';
import { subscription, type SubscriptionClient } from '$houdini/plugins';
import { handleMissingLogin } from '$lib/authentication';
import { updatesConnectionClosed } from '$lib/stores/update_complete';
import { createClient } from 'graphql-sse';

const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT;
export default new HoudiniClient({
	url: browser || !graphqlEndpoint ? '/query' : graphqlEndpoint,
	plugins: [subscription(sseSockets), handleMissingLogin('UserInfo')]
});

function sseSockets() {
	const client = createClient({
		url: '/query',
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
					next: handlers.next,
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
