import { browser } from '$app/environment';
import { isAuthenticated, isUnauthenticated } from '$lib/authentication';
import {
	Client,
	cacheExchange,
	fetchExchange,
	mapExchange,
	ssrExchange,
	type Exchange,
	type SSRData,
	type SSRExchange
} from '@urql/core';
import { createSubscriptionExchange } from './subscription';

const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT;

/**
 * Resolve the GraphQL endpoint depending on environment.
 * - In the browser: always use the proxied `/graphql` route.
 * - On the server: use the configured upstream when set, otherwise fall back to `/graphql`.
 */
function resolveUrl(): string {
	if (browser) return '/graphql';
	return graphqlEndpoint || '/graphql';
}

export interface CreateClientOptions {
	/** SvelteKit's `fetch` from a `load` function, or `globalThis.fetch` on the client. */
	fetch?: typeof fetch;
	/** Pre-extracted SSR data sent from server to client during hydration. */
	ssrData?: SSRData;
}

/**
 * Wrap a `fetch` implementation so that `AbortError` rejections are swallowed.
 *
 * urql's `fetchExchange` aborts the underlying fetch when an operation is torn
 * down (for example when the urql `Client` created inside a SvelteKit `load`
 * goes out of scope after the request completes). On Node.js that surfaces as
 * an unhandled `DOMException [AbortError]` which crashes the dev server.
 *
 * Returning a never-resolving promise on abort is safe: urql has already
 * delivered the result it cared about and unsubscribed from the source, so
 * nothing is waiting on this promise.
 */
function makeSafeFetch(inner: typeof fetch): typeof fetch {
	return ((input, init) =>
		inner(input, init).catch((error: unknown) => {
			if (
				error instanceof Error &&
				(error.name === 'AbortError' || (error as { code?: string }).code === 'ABORT_ERR')
			) {
				return new Promise<Response>(() => {
					/* swallow: the consumer has already torn down */
				});
			}
			throw error;
		})) as typeof fetch;
}

export interface UrqlContext {
	client: Client;
	ssr: SSRExchange;
}

/**
 * `mapExchange` that mirrors the behavior of the old Houdini
 * `handleMissingLogin` plugin: when any operation other than `UserInfo`
 * comes back with an `Unauthorized` error, flip the `isAuthenticated` store
 * so the root layout can swap the page out for the login screen. When the
 * `UserInfo` query itself succeeds, flip it back on.
 */
function authMapExchange(): Exchange {
	return mapExchange({
		onResult(result) {
			const opName = result.operation.query.definitions
				.flatMap((def) => (def.kind === 'OperationDefinition' && def.name ? [def.name.value] : []))
				.at(0);

			const errors = result.error?.graphQLErrors?.map((e) => ({ message: e.message })) ?? null;

			if (opName !== 'UserInfo' && isUnauthenticated(errors)) {
				isAuthenticated.set(false);
			} else if (opName === 'UserInfo' && result.data) {
				const me = (result.data as { me?: unknown }).me;
				if (me) {
					isAuthenticated.set(true);
				}
			}
			return result;
		}
	});
}

/**
 * Create a urql client + ssr exchange pair.
 *
 * On the server, the SSR exchange collects query results so they can be
 * serialized into the SvelteKit payload and re-hydrated on the client,
 * preventing the initial query from being re-fetched after hydration.
 *
 * The exchange chain is, in order:
 *   1. `cacheExchange` — document cache for queries
 *   2. `authMapExchange` — flips `isAuthenticated` on `Unauthorized` errors
 *   3. `ssrExchange` — collects on the server, restores on the client
 *   4. `subscriptionExchange` — routes subscriptions to `graphql-sse`
 *      (browser only; harmless no-op when no subscription operations are issued)
 *   5. `fetchExchange` — terminal exchange for queries/mutations
 */
export function createUrqlClient({ fetch, ssrData }: CreateClientOptions = {}): UrqlContext {
	const ssr = ssrExchange({
		isClient: browser,
		// Only restore data on the client; on the server we collect.
		initialState: browser ? ssrData : undefined
	});

	const exchanges: Exchange[] = [cacheExchange, authMapExchange(), ssr];

	// The SSE-backed subscription exchange only makes sense in the browser
	// (the server doesn't subscribe to anything). Adding it on the server
	// would also eagerly construct an `EventSource` against `/graphql`,
	// which we don't want during SSR.
	if (browser) {
		exchanges.push(createSubscriptionExchange());
	}

	exchanges.push(fetchExchange);

	const client = new Client({
		url: resolveUrl(),
		exchanges,
		fetch: makeSafeFetch(fetch ?? globalThis.fetch),
		// We rely on cookie-based auth that's already attached by SvelteKit's
		// `handleFetch` hook, but be explicit for browser fetches too.
		// The Nais GraphQL endpoint only accepts POST requests; urql defaults to
		// GET for queries, so opt out of that here.
		preferGetMethod: false,
		fetchOptions: () => ({
			method: 'POST',
			credentials: 'include'
		})
	});

	return { client, ssr };
}
