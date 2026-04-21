import { graphql as gql } from '$lib/urql/gql';

/**
 * Fragment used by `NetworkPolicy.svelte` to render the inbound and
 * outbound network policy rules of a workload.
 *
 * The fragment is colocated as a `.ts` module (rather than inline in
 * the `.svelte` file) so callers can import and spread it from their
 * own query documents without dragging the component into a
 * server-only `load` graph.
 */
export const NetworkPolicyFragment = gql(/* GraphQL */ `
	fragment NetworkPolicyFragment on Workload {
		__typename
		name
		teamEnvironment {
			environment {
				name
			}
		}
		team {
			slug
		}
		networkPolicy {
			inbound {
				rules {
					mutual
					targetTeamSlug
					targetWorkloadName
					targetWorkload {
						__typename
						name
						team {
							slug
						}
						teamEnvironment {
							environment {
								name
							}
						}
					}
				}
			}
			outbound {
				rules {
					mutual
					targetTeamSlug
					targetWorkloadName
					targetWorkload {
						__typename
						name
						team {
							slug
						}
						teamEnvironment {
							environment {
								name
							}
						}
					}
				}
				external {
					__typename
					ports
					target
				}
			}
		}
	}
`);
