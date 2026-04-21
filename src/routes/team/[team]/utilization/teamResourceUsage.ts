import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `TeamResourceUsage` query.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power the team utilization overview page
 * (`/team/[team]/utilization`).
 */
export const TeamResourceUsageQuery = gql(/* GraphQL */ `
	query TeamResourceUsage($team: Slug!) {
		currentUnitPrices {
			cpu {
				value
			}
			memory {
				value
			}
		}
		team(slug: $team) {
			cpuUtil: workloadUtilization(resourceType: CPU) {
				workload {
					id
					name
					__typename
					teamEnvironment {
						environment {
							name
						}
					}
				}
				requested
				used
			}

			memUtil: workloadUtilization(resourceType: MEMORY) {
				workload {
					id
					name
					__typename
					teamEnvironment {
						environment {
							name
						}
					}
				}
				requested
				used
			}
		}
	}
`);
