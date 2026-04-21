import { graphql as gql } from '$lib/urql/gql';

/**
 * Fragment used by `Manifest.svelte` to render the raw YAML manifest of
 * a workload (application or job).
 *
 * The fragment is colocated as a `.ts` module (rather than inline in
 * the `.svelte` file) so callers can import and spread it from their
 * own query documents without dragging the component into a
 * server-only `load` graph.
 */
export const ManifestFragment = gql(/* GraphQL */ `
	fragment ManifestFragment on Workload {
		name
		manifest {
			content
		}
	}
`);
