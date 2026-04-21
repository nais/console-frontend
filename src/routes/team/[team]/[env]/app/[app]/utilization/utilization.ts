import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `ResourceUtilizationForApp` query.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power the application utilization page
 * (`/team/[team]/[env]/app/[app]/utilization`).
 */
export const ResourceUtilizationForAppQuery = gql(/* GraphQL */ `
	query ResourceUtilizationForApp(
		$team: Slug!
		$app: String!
		$env: String!
		$start: Time!
		$end: Time!
	) {
		currentUnitPrices {
			cpu {
				value
			}
			memory {
				value
			}
		}
		team(slug: $team) {
			environment(name: $env) {
				application(name: $app) {
					name
					resources {
						limits {
							cpu
							memory
						}
						requests {
							cpu
							memory
						}
					}
					activityLog(first: 100, filter: { activityTypes: [APPLICATION_SCALED, DEPLOYMENT] }) {
						nodes {
							id
							createdAt
							__typename
							... on ApplicationScaledActivityLogEntry {
								id
								appScaled: data {
									newSize
									direction
								}
							}
							... on DeploymentActivityLogEntry {
								id
								createdAt
							}
						}
					}
					utilization {
						requested_memory_series: requestedSeries(
							input: { start: $start, end: $end, resourceType: MEMORY }
						) {
							timestamp
							value
						}
						limit_memory_series: limitSeries(
							input: { start: $start, end: $end, resourceType: MEMORY }
						) {
							timestamp
							value
						}

						requested_cpu_series: requestedSeries(
							input: { start: $start, end: $end, resourceType: CPU }
						) {
							timestamp
							value
						}
						limit_cpu_series: limitSeries(input: { start: $start, end: $end, resourceType: CPU }) {
							timestamp
							value
						}
						cpu_series: series(input: { start: $start, end: $end, resourceType: CPU }) {
							timestamp
							value
							instance
						}
						memory_series: series(input: { start: $start, end: $end, resourceType: MEMORY }) {
							timestamp
							value
							instance
						}
						recommendations {
							cpuRequestCores
							memoryLimitBytes
							memoryRequestBytes
						}
					}
				}
			}
		}
	}
`);
