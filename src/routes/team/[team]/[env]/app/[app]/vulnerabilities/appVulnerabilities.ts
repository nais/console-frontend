import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `ApplicationImageDetails` query for the application
 * vulnerabilities page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power `/team/[team]/[env]/app/[app]/vulnerabilities`.
 *
 * The `@cache(policy: NetworkOnly)` and `@paginate(mode: SinglePage)`
 * directives from the Houdini document are dropped — pagination is
 * URL-driven via `cursorPaginationLoaders` (the image's `activityLog`
 * connection accepts `first`/`last`/`before`/`after` directly).
 */
export const ApplicationImageDetailsQuery = gql(/* GraphQL */ `
	query ApplicationImageDetails(
		$team: Slug!
		$env: String!
		$app: String!
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
				workload(name: $app) {
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
