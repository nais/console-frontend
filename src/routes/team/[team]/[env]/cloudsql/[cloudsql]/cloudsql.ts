import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `SqlInstance` query for the Cloud SQL instance detail page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power `/team/[team]/[env]/cloudsql/[cloudsql]`.
 */
export const SqlInstanceQuery = gql(/* GraphQL */ `
	query SqlInstance($env: String!, $team: Slug!, $name: String!) {
		team(slug: $team) {
			slug
			environment(name: $env) {
				sqlInstance(name: $name) {
					__typename
					id
					name
					teamEnvironment {
						environment {
							name
						}
					}

					auditLog {
						logUrl
					}

					cascadingDelete
					healthy
					connectionName
					diskAutoresize
					diskAutoresizeLimit
					workload {
						name
						__typename
						teamEnvironment {
							environment {
								name
							}
						}
						team {
							slug
						}
					}
					issues {
						edges {
							node {
								id
								...IssueFragment
							}
						}
					}
					state
					tier
					cost {
						sum
					}
					metrics {
						cpu {
							cores
							utilization
						}
						memory {
							quotaBytes
							utilization
						}
						disk {
							quotaBytes
							utilization
						}
					}
					highAvailability
					backupConfiguration {
						enabled
						startTime
						retainedBackups
						pointInTimeRecovery
					}
					maintenanceWindow {
						day
						hour
					}
					maintenanceVersion
					version
					projectID
					database {
						name
						charset
						collation
						healthy
					}
					flags {
						pageInfo {
							hasNextPage
							hasPreviousPage
							totalCount
							pageStart
							pageEnd
							startCursor
							endCursor
						}
						edges {
							node {
								name
								value
							}
						}
					}
					status {
						publicIpAddress
						privateIpAddress
					}

					users {
						pageInfo {
							hasNextPage
							hasPreviousPage
							totalCount
							pageStart
							pageEnd
							startCursor
							endCursor
						}
						edges {
							node {
								name
								authentication
							}
						}
					}
				}
			}
		}
	}
`);
