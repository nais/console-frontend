import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `JobImageDetails` query for the job vulnerabilities page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power `/team/[team]/[env]/job/[job]/vulnerabilities`.
 *
 * The `@cache(policy: NetworkOnly)` directive from the Houdini
 * document is dropped — pagination of the image's `activityLog`
 * connection is URL-driven via `cursorPaginationLoaders`.
 */
export const JobImageDetailsQuery = gql(/* GraphQL */ `
	query JobImageDetails(
		$team: Slug!
		$env: String!
		$job: String!
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
	) {
		team(slug: $team) {
			slug
			environment(name: $env) {
				environment {
					name
				}
				workload(name: $job) {
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
					image {
						id
						name
						tag
						hasSBOM
						activityLog(first: $first, last: $last, before: $before, after: $after) {
							pageInfo {
								hasNextPage
								endCursor
								hasPreviousPage
								startCursor
								totalCount
								pageStart
								pageEnd
							}
							edges {
								node {
									id
									__typename
									...ActivityLogEntryFragment
								}
							}
						}
						vulnerabilitySummary {
							critical
							high
							medium
							low
							unassigned
							riskScore
							lastUpdated
						}
						workloadReferences {
							nodes {
								workload {
									id
									__typename
									team {
										slug
									}
									teamEnvironment {
										environment {
											name
										}
									}
									name
								}
							}
						}
					}
				}
			}
		}
	}
`);
