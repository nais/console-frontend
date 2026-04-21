import { graphql as gql } from '$lib/urql/gql';

/**
 * Fragment used by the Valkey single-instance `Manifest.svelte` to
 * render a snippet showing how to use this Valkey instance from a
 * workload manifest.
 *
 * The fragment is colocated as a `.ts` module (rather than inline in
 * the `.svelte` file) so callers can import and spread it from their
 * own query documents without dragging the component into a
 * server-only `load` graph.
 */
export const ValkeyManifestFragment = gql(/* GraphQL */ `
	fragment ValkeyManifestFragment on Valkey {
		name
		memory
		tier
		maxMemoryPolicy
	}
`);
