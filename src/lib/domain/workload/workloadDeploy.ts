import { graphql as gql } from '$lib/urql/gql';

/**
 * Fragment used by `WorkloadDeploy.svelte` to render the most recent
 * deployment metadata (timestamp, repository, status) for a workload.
 *
 * The fragment is colocated as a `.ts` module (rather than inline in
 * the `.svelte` file) so callers can import and spread it from their
 * own query documents without dragging the component into a
 * server-only `load` graph.
 */
export const WorkloadDeployFragment = gql(/* GraphQL */ `
	fragment WorkloadDeployFragment on Workload {
		deployments(first: 1) {
			nodes {
				createdAt
				repository
				statuses {
					nodes {
						state
					}
				}
			}
		}
	}
`);
