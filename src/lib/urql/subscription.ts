import { dev } from '$app/environment';
import { updatesConnectionClosed } from '$lib/stores/update_complete';
import { subscriptionExchange, type Exchange } from '@urql/core';
import { createClient as createSSEClient, type Client as SSEClient } from 'graphql-sse';

/**
 * Lazily-instantiated `graphql-sse` client.
 *
 * We only ever want one SSE client per browser tab (so all subscriptions
 * share a single HTTP connection), and we don't want to construct it on the
 * server where there's nothing to subscribe to. The factory is invoked on
 * the first subscription, which only happens client-side.
 */
let sseClient: SSEClient | undefined;

function getSSEClient(): SSEClient {
	if (!sseClient) {
		sseClient = createSSEClient({
			url: '/graphql',
			onMessage: (data) => {
				if (dev) {
					console.debug('subscription message', data);
				}
			},
			retryAttempts: 1000
		});
	}
	return sseClient;
}

/**
 * urql `subscriptionExchange` wired to the existing `graphql-sse` client.
 *
 * This is a lift of the `sseSockets` factory previously used by the Houdini
 * client (see the deleted `src/client.ts`). The shape mirrors what urql
 * expects so subscription queries written with the generated `graphql()`
 * helper just work, while keeping the same on-wire transport (SSE) and the
 * same `updatesConnectionClosed` store the rest of the app reads from.
 */
export function createSubscriptionExchange(): Exchange {
	return subscriptionExchange({
		forwardSubscription: (operation) => ({
			subscribe: (sink) => {
				const unsubscribe = getSSEClient().subscribe(
					{
						// `FetchBody.query` is typed as optional in urql v6 (it can be
						// replaced by `documentId` for persisted documents), but we don't
						// use persisted queries, so it's always present in practice. Fall
						// back to an empty string to satisfy `RequestParams`'s required
						// `query: string` shape from `graphql-sse`.
						query: operation.query ?? '',
						variables: operation.variables as Record<string, unknown> | undefined,
						operationName: operation.operationName ?? undefined
					},
					{
						next: (value) => sink.next(value as Parameters<typeof sink.next>[0]),
						error: (err) => sink.error(err),
						complete: () => {
							updatesConnectionClosed.set(new Date());
							sink.complete();
						}
					}
				);

				return { unsubscribe };
			}
		})
	});
}
