import type { Client } from '@urql/core';
import { getContextClient, setContextClient } from '@urql/svelte';

/**
 * Re-export the official `@urql/svelte` context helpers so the rest of the
 * app has a single import path for them. Using the urql-shipped helpers
 * means components like `queryStore` / `mutationStore` from `@urql/svelte`
 * will pick up the same client automatically, without us having to thread
 * it through manually.
 */
export { getContextClient, setContextClient };

/**
 * Backwards-compatible alias for {@link setContextClient}.
 *
 * The early proof-of-concept code used a local Svelte context with our own
 * key. Anything still importing this name keeps working, but new code should
 * prefer {@link setContextClient}.
 */
export function setUrqlClient(client: Client): Client {
	setContextClient(client);
	return client;
}

/**
 * Backwards-compatible alias for {@link getContextClient}.
 *
 * New code should prefer {@link getContextClient}.
 */
export function getUrqlClient(): Client {
	return getContextClient();
}
