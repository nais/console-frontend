import { graphql as gql } from '$lib/urql/gql';

/**
 * Fragment used by the OpenSearch single-instance `Manifest.svelte` to
 * render a snippet showing how to use this OpenSearch instance from a
 * workload manifest.
 *
 * The fragment is colocated as a `.ts` module (rather than inline in
 * the `.svelte` file) so callers can import and spread it from their
 * own query documents without dragging the component into a
 * server-only `load` graph.
 */
export const OpenSearchManifestFragment = gql(/* GraphQL */ `
	fragment OpenSearchManifestFragment on OpenSearch {
		name
	}
`);
